'use client'

import { useEffect, useState } from "react"
import axios from "axios"

export type Student = {
  _id: string,
  matricule?: string,
  name: string,
  gender: 'female' | 'male',
  status: 'active' | 'malade' | 'special'
}

export type Class = {
  _id: string,
  name: string,
  level: string
}

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({});
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});

  // handle classes

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/classes');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }

  // fetch classes on load
  useEffect(() => {
    fetchClasses();
  }, []);

  const addClass = async function (classData: Omit<Class, '_id'>) {
    try {
      const response = await axios.post('/api/classes', classData);
      setClasses(prev => [...prev, response.data.class]);
    } catch (error) {
      console.error('Error adding class:', error);
    }
  }

  const deleteClass = async function (classId: string) {
    try {
      await axios.delete(`/api/classes`, { data: { classId } });
      setClasses(prev => prev.filter(c => c._id !== classId));
      setStudentsByClass(prev => {
        const next = { ...prev };
        delete next[classId];
        return next;
      });

    } catch (error) {
      console.error('Error deleting class:', error);
    }
  }

  const importClasses = async function (classesData: { name: string, level: string, students: Omit<Student, '_id'>[] }[]) {
    try {
      await axios.post('/api/classes/import', { classes: classesData });
      fetchClasses();
    } catch (error) {
      console.error('Error adding class:', error);
    }
  }

  // handle students

  const refreshStudents = async (classId: string) => {
    try {
      const response = await axios.get(`/api/classes/${classId}/students`);
      setStudentsByClass(prev => ({ ...prev, [classId]: response.data.students }));
    } catch (error) {
      console.error('Error refreshing students:', error);
    }
  }

  const fetchStudents = async (classId: string) => {
    if (classId in studentsByClass) return;
    setLoadingStudents(prev => ({ ...prev, [classId]: true }));
    try {
      const response = await axios.get(`/api/classes/${classId}/students`);
      setStudentsByClass(prev => ({ ...prev, [classId]: response.data.students }));

    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(prev => ({ ...prev, [classId]: false }));
    }
  }

  const addStudent = async function (classId: string, studentData: Omit<Student, '_id'>) {
    try {
      const response = await axios.post(`/api/classes/${classId}/students`, studentData);
      setStudentsByClass(prev => {
        const next = { ...prev };
        if (classId in next) {
          next[classId] = [...next[classId], response.data.student];
        } else {
          next[classId] = [response.data.student];
        }
        return next;
      });
    } catch (error) {
      console.error('Error adding student:', error);
    }
  }

  const deleteStudent = async function (classId: string, studentId: string) {
    try {
      await axios.delete(`/api/classes/${classId}/students/${studentId}`);
      setStudentsByClass(prev => {
        const next = { ...prev };
        if (classId in next) {
          next[classId] = next[classId].filter(s => s._id !== studentId);
        }
        return next;
      });
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  }

  const updateStudent = async function (classId: string, studentId: string, studentData: Partial<Omit<Student, '_id'>>) {
    try {
      const response = await axios.patch(`/api/classes/${classId}/students/${studentId}`, { studentId, ...studentData });
      setStudentsByClass(prev => {
        const next = { ...prev };
        if (classId in next) {
          next[classId] = next[classId].map(s => s._id === studentId ? response.data.student : s);
        }
        return next;
      });
    } catch (error) {
      console.error('Error updating student:', error);
    }
  }

  return {
    classes, loading, fetchClasses, fetchStudents,
    studentsByClass, loadingStudents, refreshStudents,importClasses,
    addClass, deleteClass, addStudent, deleteStudent, updateStudent
  };
}