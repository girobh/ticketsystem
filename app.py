from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_login import current_user, LoginManager, UserMixin, login_user, login_required, logout_user
import mysql.connector
import bcrypt
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'admin'

#################################################################################################################
# Connect to MySQL
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="welcome1",
    database="user_management"
)

login_manager = LoginManager()
login_manager.init_app(app)

#################################################################################################################
# Classe User
class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

    def tasks(self):
        cur = mydb.cursor(dictionary=True)
        cur.execute("SELECT * FROM tasks WHERE user_id = %s", (self.id,))
        tasks = []
        for task_data in cur.fetchall():
            task = Task(id=task_data['id'], user_id=task_data['user_id'], task_name=task_data['task_name'], task_description=task_data['task_description'], task_category=task_data['task_category'], task_status=task_data['task_status'])
            tasks.append(task)
        cur.close()
        return tasks

#################################################################################################################
# Classe Task
class Task:
    def __init__(self, id, user_id, task_name, task_description, task_category, task_status):
        self.id = id
        self.user_id = user_id
        self.task_name = task_name
        self.task_description = task_description
        self.task_category = task_category
        self.task_status = task_status

#################################################################################################################
# Load User
@login_manager.user_loader
def load_user(user_id):
    cur = mydb.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    cur.close()
    if user:
        return User(user['id'], user['username'])
    return None

#################################################################################################################
# Router Home
@app.route('/')
def home():
    return render_template('home.html')

#################################################################################################################
# Router Register
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password'].encode('utf-8')
        hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
        cur = mydb.cursor()
        cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, hashed_password))
        mydb.commit()
        cur.close()
        flash('Registration successful. Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

#################################################################################################################
# Router Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password'].encode('utf-8')

        cur = mydb.cursor(dictionary=True)
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()

        if user and bcrypt.checkpw(password, user['password'].encode('utf-8')):
            login_user(User(user['id'], user['username']))
            flash('Login successful.', 'success')
            return redirect(url_for('profile'))
        else:
            flash('Invalid username or password.', 'danger')

    return render_template('login.html')

#################################################################################################################
# Router Profile
@app.route('/profile')
@login_required
def profile():
    user_tasks = current_user.tasks()
    return render_template('profile.html', username=current_user.username, tasks=user_tasks)

#################################################################################################################
# Router Logout
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return render_template('logout.html')

#################################################################################################################
# Router Add Task
@app.route('/add_task', methods=['POST'])
@login_required
def add_task():
    task_name = request.form['task_name']
    task_description = request.form['task_description']
    task_category = request.form['task_category']
    task_status = request.form['task_status']
    cur = mydb.cursor()
    cur.execute("INSERT INTO tasks (user_id, task_name, task_description, task_category, task_status) VALUES (%s, %s, %s, %s, %s)", (current_user.id, task_name, task_description, task_category, task_status))
    mydb.commit()
    cur.close()
    flash('Task added successfully.', 'success')
    return redirect(url_for('profile'))

#################################################################################################################
# Router Edit Task
@app.route('/edit_task/<int:task_id>', methods=['GET', 'POST'])
@login_required
def edit_task(task_id):
    cur = mydb.cursor(dictionary=True)
    cur.execute("SELECT * FROM tasks WHERE id = %s AND user_id = %s", (task_id, current_user.id))
    task = cur.fetchone()
    cur.close()

    if not task:
        flash('Task not found.', 'danger')
        return redirect(url_for('profile'))

    if request.method == 'POST':
        task_name = request.form['task_name']
        task_description = request.form['task_description']
        task_category = request.form['task_category']
        task_status = request.form['task_status']
        cur = mydb.cursor()
        cur.execute("UPDATE tasks SET task_name = %s, task_description = %s, task_category = %s, task_status = %s WHERE id = %s", (task_name, task_description, task_category, task_status, task_id))
        mydb.commit()
        cur.close()
        flash('Task updated successfully.', 'success')
        return redirect(url_for('profile'))

    return render_template('edit_task.html', task=task)

#################################################################################################################
# Router Delete Task
@app.route('/delete_task/<int:task_id>', methods=['POST'])
@login_required
def delete_task(task_id):
    cur = mydb.cursor()
    cur.execute("DELETE FROM tasks WHERE id = %s AND user_id = %s", (task_id, current_user.id))
    mydb.commit()
    cur.close()
    flash('Task deleted successfully.', 'success')
    return redirect(url_for('profile'))

#################################################################################################################
# Router Filter Tasks
@app.route('/filter_tasks', methods=['POST'])
@login_required
def filter_tasks():
    category_filter = request.form['category_filter']
    status_filter = request.form['status_filter']

    cur = mydb.cursor(dictionary=True)
    if status_filter == 'all':
        cur.execute("SELECT * FROM tasks WHERE user_id = %s AND task_category LIKE %s", (current_user.id, '%' + category_filter + '%'))
    elif status_filter == 'not_completed':
        cur.execute("SELECT * FROM tasks WHERE user_id = %s AND task_category LIKE %s AND task_status = 'NOT COMPLETED'", (current_user.id, '%' + category_filter + '%'))
    else:
        cur.execute("SELECT * FROM tasks WHERE user_id = %s AND task_category LIKE %s AND task_status = %s", (current_user.id, '%' + category_filter + '%', status_filter))
    tasks = []
    for task_data in cur.fetchall():
        task = Task(id=task_data['id'], user_id=task_data['user_id'], task_name=task_data['task_name'], task_description=task_data['task_description'], task_category=task_data['task_category'], task_status=task_data['task_status'])
        tasks.append(task)
    cur.close()
    return render_template('profile.html', username=current_user.username, tasks=tasks)

#################################################################################################################
# APP RUN
if __name__ == '__main__':
    app.run(debug=True)