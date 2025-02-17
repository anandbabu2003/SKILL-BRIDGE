from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)

client = MongoClient("mongodb+srv://user:user@cluster0.c161u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["job_portal"]
users_collection = db["users"]
jobs_collection = db["jobs"]

@app.route("/<path:filename>")
def serve_assets(filename):
    return send_from_directory("assets", filename)

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400
    user = {
        "name": data.get("name"),
        "email": email,
        "password_hash": generate_password_hash(data.get("password")),
        "phone_no": data.get("phone"),
        "type": data.get("role")
    }
    users_collection.insert_one(user)
    return jsonify({"message": "User registered successfully"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user["password_hash"], data.get("password")):
        return jsonify({"error": "Invalid credentials"}), 401
    user.pop("password_hash")
    del user["_id"]
    return jsonify({"message": "Login successful", "user": user})

@app.route("/api/set_user_type", methods=["POST"])
def set_user_type():
    data = request.json
    email = data.get("mail")
    user_type = data.get("type")
    result = users_collection.update_one({"email": email}, {"$set": {"type": user_type}})
    if result.matched_count == 0:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User type updated"})

@app.route("/api/new_job", methods=["POST"])
def new_job():
    data = request.json
    job = {
        "email": data.get("email"),
        "title": data.get("title"),
        "description": data.get("description"),
        "skills": data.get("skills"),
        "location": data.get("location"),
        "daily_wage": data.get("daily_wage"),
        "duration": data.get("duration"),
        "assigned": False,
        "assigned_mail": None,
        "posted_on": datetime.now(),
        "applicants": []
    }
    job_id = jobs_collection.insert_one(job).inserted_id
    return jsonify({"message": "Job posted successfully", "job_id": str(job_id)})

@app.route("/api/jobs", methods=["GET"])
def get_all_jobs():
    jobs = list(jobs_collection.find({}))
    for job in jobs:
        job["job_id"] = str(job.pop("_id"))
    return jsonify(jobs)

@app.route("/api/jobs/unfilled", methods=["GET"])
def get_unfilled_jobs():
    jobs = list(jobs_collection.find({"assigned": False}))
    jobs = [job for job in jobs if job.get("assigned_mail") is None]
    for job in jobs:
        job["job_id"] = str(job.pop("_id"))
    return jsonify(jobs)

@app.route("/api/jobs/unapplied", methods=["GET"])
def get_unapplied_jobs():
    email = request.args.get("email")
    jobs = list(jobs_collection.find({"applicants": {"$ne": email}}))
    for job in jobs:
        job["job_id"] = str(job.pop("_id"))
    return jsonify(jobs)

@app.route("/api/jobs/filled", methods=["GET"])
def get_filled_jobs():
    jobs = list(jobs_collection.find({"assigned": True}))
    jobs = [job for job in jobs if job["assigned_mail"] is not None]
    for job in jobs:
        job["job_id"] = str(job.pop("_id"))
    return jsonify(jobs)

@app.route("/api/user_jobs", methods=["GET"])
def get_user_jobs():
    email = request.args.get("email")
    jobs = list(jobs_collection.find({"applicants": email}))
    for job in jobs:
        job["job_id"] = str(job.pop("_id"))
    return jsonify(jobs)

@app.route("/api/user_jobs_filled", methods=["GET"])
def get_user_jobs_filled():
    email = request.args.get("email")
    jobs = list(jobs_collection.find({"assigned_mail": email, "assigned": True}))
    for job in jobs:
        job["job_id"] = str(job.pop("_id"))
    return jsonify(jobs)

@app.route("/api/employee_jobs", methods=["GET"])
def get_employee_jobs():
    email = request.args.get("email")
    jobs = list(jobs_collection.find({"email": email}))
    for job in jobs:
        job["job_id"] = str(job.pop("_id"))
    return jsonify(jobs)

@app.route("/api/employee_job_unassigned", methods=["GET"])
def get_employee_job_unassigned():
    email = request.args.get("email")
    results = []
    jobs = list(jobs_collection.find({"email": email, "assigned": False, "assigned_mail": None}))
    for job in jobs:
        if len(job.get("applicants", [])) == 0:
            del jobs[jobs.index(job)]
        else:
            for applicant in job["applicants"]:
                appl = users_collection.find_one({"email": applicant}, {"_id": 0, "password_hash": 0})
                result = {"job_id": str(job["_id"]), "title": job["title"], "email": applicant, "name": appl["name"], "assigned": False}
                results.append(result)
    return jsonify(results)

@app.route("/api/job", methods=["GET"])
def get_job_info():
    job_id = request.args.get("id")
    job = jobs_collection.find_one({"_id": ObjectId(job_id)}, {"_id": 0})
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job)

@app.route("/api/delete_job", methods=["POST"])
def delete_job():
    job_id = request.json.get("id")
    result = jobs_collection.delete_one({"_id": ObjectId(job_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({"message": "Job deleted successfully"})

@app.route("/api/cancel_job", methods=["POST"])
def cancel_job():
    job_id = request.json.get("job_id")
    email = request.json.get("email")
    result = jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$pull": {"applicants": email}})
    if result.matched_count == 0:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({"message": "Job application cancelled"})

@app.route("/api/user", methods=["GET"])
def get_user_info():
    email = request.args.get("email")
    user = users_collection.find_one({"email": email}, {"_id": 0, "password_hash": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@app.route("/api/apply_job", methods=["POST"])
def apply_job():
    data = request.json
    job_id = data.get("job_id")
    email = data.get("email")
    result = jobs_collection.update_one({"_id": ObjectId(job_id), "assigned": False, "assigned_mail": None}, {"$push": {"applicants": email}})
    if result.matched_count == 0:
        return jsonify({"error": "Job not found or already assigned"}), 404
    return jsonify({"message": "Job applied successfully"})

@app.route("/api/assign_job", methods=["POST"])
def assign_job():
    data = request.json
    job_id = data.get("job_id")
    email = data.get("email")
    result = jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$set": {"assigned": True, "assigned_mail": email}})
    if result.matched_count == 0:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({"message": "Job assigned successfully"})

@app.route("/api/employer_stats", methods=["GET"])
def employer_stats():
    email = request.args.get("email")
    jobs_posted = jobs_collection.count_documents({"email": email})
    jobs_filled = jobs_collection.count_documents({"email": email, "assigned": True})
    return jsonify({"jobs_posted": jobs_posted, "jobs_filled": jobs_filled})

if __name__ == "__main__":
    app.run(debug=True)
