import React, { useState, useEffect } from 'react';
import '../ComponentsCss/Courses.css';
import CourseFormModal from './CourseForm'; // Import the modal component

const CoursesComponent = ({ courses, fetchCourses, loadingCourses, userType }) => {
    const [showCourseForm, setShowCourseForm] = useState(false); // State to manage modal visibility
    const [selectedCourse, setSelectedCourse] = useState(null); // State to store selected course for editing
    const [userCourses, setUserCourses] = useState([]); // State to store user's registered courses

    useEffect(() => {
        if (userType === "student") {
            fetchUserCourses();
        }
    }, []);

    const fetchUserCourses = async () => {
        try {
            const response = await fetch('http://localhost:5000/get_student_courses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user courses');
            }

            const data = await response.json();
            setUserCourses(data.courses);
        } catch (error) {
            console.error('Error fetching user courses:', error);
        }
    };

    const toggleCourseForm = (course) => {
        setSelectedCourse(course); // Set selected course for editing or null for new course
        setShowCourseForm(!showCourseForm); // Toggle modal visibility
    };

    const handleSaveCourse = async (course) => {
        try {
            const method = course.id ? 'PUT' : 'POST';
            const endpoint = course.id ? `update_course/${course.id}` : 'add_course';

            const response = await fetch(`http://localhost:5000/${endpoint}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json', // Add Content-Type header
                },
                body: JSON.stringify(course),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${course.id ? 'update' : 'add'} course`);
            }
            fetchCourses(); // Refresh the courses list

            setShowCourseForm(false); // Close the modal after saving
        } catch (error) {
            console.error(`Error ${course.id ? 'updating' : 'adding'} course:`, error);
        }
    };

    const handleRemoveCourse = async (courseId) => {
        try {
            const response = await fetch(`http://localhost:5000/remove_course/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Ensure token is sent
                },
            });
            if (!response.ok) {
                throw new Error('Failed to remove course');
            }
            fetchCourses(); // Refresh courses after removing
        } catch (error) {
            console.error('Error removing course:', error);
        }
    };

    const handleAddCourse = async (courseId) => {
        try {
            const response = await fetch('http://localhost:5000/add_course_to_user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course_id: courseId }),
            });
    
            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }
    
            const data = await response.json();
            console.log(data.message); // Optional: Handle the response message if needed
            fetchUserCourses(); // Refresh the user's registered courses
        } catch (error) {
            console.error('Error adding course to user:', error.message);
        }
    };
    
    const handleRemoveCourseFromUser = async (courseId) => {
        try {
            const response = await fetch('http://localhost:5000/remove_course_from_user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course_id: courseId }),
            });
    
            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }
    
            const data = await response.json();
            console.log(data.message); // Optional: Handle the response message if needed
            fetchUserCourses(); // Refresh the user's registered courses
        } catch (error) {
            console.error('Error removing course from user:', error.message);
        }
    };
    
    const getRowClassName = (level) => {
        switch (level) {
            case 'Advanced':
                return 'advanced-level';
            case 'Intermediate':
                return 'intermediate-level';
            case 'Beginner':
                return 'beginner-level';
            default:
                return '';
        }
    };

    const filteredCourses = courses.filter(course => !userCourses.includes(course.id));

    return (
        <div className="courses">
            {loadingCourses ? (
                <p>Loading courses...</p>
            ) : (
                <>
                    {userType === "student" && userCourses.length > 0 && (
                        <>
                            <h2>My Registered Courses</h2>
                            <table className="courses-table">
                                <thead>
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Instructor</th>
                                        <th>Start Date</th>
                                        <th>Duration</th>
                                        <th>Level</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses
                                        .filter(course => userCourses.includes(course.id))
                                        .map((course) => (
                                            <tr key={course.id} className={getRowClassName(course.level)}>
                                                <td>{course.name}</td>
                                                <td>{course.instructor}</td>
                                                <td>{new Date(course.startDate).toLocaleDateString()}</td>
                                                <td>{course.duration}</td>
                                                <td>{course.level}</td>
                                                <td>
                                                    <button className="remove-btn" onClick={() => handleRemoveCourseFromUser(course.id)}>Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </>
                    )}
                    {filteredCourses.length === 0 ? (
                        <h2>No Available Courses</h2>
                    ) : (
                        <>
                            <h2>Available Courses</h2>
                            <table className="courses-table">
                                <thead>
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Instructor</th>
                                        <th>Start Date</th>
                                        <th>Duration</th>
                                        <th>Level</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map((course) => (
                                        <tr key={course.id} className={getRowClassName(course.level)}>
                                            <td>{course.name}</td>
                                            <td>{course.instructor}</td>
                                            <td>{new Date(course.startDate).toLocaleDateString()}</td>
                                            <td>{course.duration}</td>
                                            <td>{course.level}</td>
                                            <td>
                                                {userType === "student" ? (
                                                    <>
                                                        <button className="edit-btn" onClick={() => handleAddCourse(course.id)}>Add</button>
                                                    </>
                                                ) : (
                                                    <p>
                                                        <button className="edit-btn" onClick={() => toggleCourseForm(course)}>Edit</button>
                                                        <button className="remove-btn" onClick={() => handleRemoveCourse(course.id)}>Remove</button>
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </>
            )}
            <CourseFormModal
                isOpen={showCourseForm}
                onClose={() => setShowCourseForm(false)}
                onSave={handleSaveCourse}
                course={selectedCourse}
            />
        </div>
    );
};

export default CoursesComponent;