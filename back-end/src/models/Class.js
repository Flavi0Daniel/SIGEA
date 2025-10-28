class Class {
    constructor({
      id,
      course_id,
      instructor_id,
      name,
      start_date,
      end_date,
      max_students,
      schedule,
      is_active,
      created_at
    }) {
      this.id = id;
      this.course_id = course_id;
      this.instructor_id = instructor_id;
      this.name = name;
      this.start_date = start_date;
      this.end_date = end_date;
      this.max_students = max_students;
      this.schedule = schedule;
      this.is_active = is_active;
      this.created_at = created_at;
    }
  
    toJSON() {
      return { ...this };
    }
  }
  
  module.exports = Class;
  