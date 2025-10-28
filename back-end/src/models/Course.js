class Course {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.description = data.description;
      this.duration_hours = data.duration_hours;
      this.price = data.price;
      this.image = data.image;
      this.is_active = data.is_active;
      this.created_by = data.created_by;
      this.created_at = data.created_at;
      this.updated_at = data.updated_at;
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        duration_hours: this.duration_hours,
        price: this.price,
        image: this.image,
        is_active: this.is_active,
        created_by: this.created_by,
        created_at: this.created_at,
        updated_at: this.updated_at
      };
    }
  }
  
  module.exports = Course;
  