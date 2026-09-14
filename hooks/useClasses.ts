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

// Pulls a readable message out of an Axios error, falling back to a generic one.
function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  // Starts true since fetchClasses runs immediately on mount — avoids a
  // synchronous setState(true) inside the effect body (see React warning).
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({});
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [error, setError] = useState<string | null>(null);

  // handle classes

  // Pure fetch — no setState here. Safe to call from anywhere, including
  // directly inside a useEffect, without tripping the "setState in effect" check.
  const getClassesData = async (): Promise<Class[]> => {
    const response = await axios.get('/api/classes');
    return response.data.classes;
  }

  // Public refetch helper for use in event handlers (e.g. after import, or a
  // manual "refresh" button). This one does update state, so it should only
  // ever be called from event handlers / other async actions — never directly
  // from a useEffect body.
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getClassesData();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError(getErrorMessage(error, 'خطأ في تحميل الأقسام'));
    } finally {
      setLoading(false);
    }
  }

  // Initial load on mount. The effect calls the pure fetcher itself and
  // handles setState inline in its own .then/.catch/.finally — this is the
  // pattern React's docs recommend for data fetching in effects.
  useEffect(() => {
    let ignore = false;

    getClassesData()
      .then((data) => {
        if (!ignore) setClasses(data);
      })
      .catch((err) => {
        console.error('Error fetching classes:', err);
        if (!ignore) setError(getErrorMessage(err, 'خطأ في تحميل الأقسام'));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const addClass = async function (classData: Omit<Class, '_id'>): Promise<boolean> {
    setError(null);
    try {
      const response = await axios.post('/api/classes', classData);
      setClasses(prev => [...prev, response.data.class]);
      return true;
    } catch (error) {
      console.error('Error adding class:', error);
      setError(getErrorMessage(error, 'خطأ في إضافة القسم'));
      return false;
    }
  }

  const deleteClass = async function (classId: string): Promise<boolean> {
    setError(null);
    try {
      await axios.delete(`/api/classes`, { data: { classId } });
      setClasses(prev => prev.filter(c => c._id !== classId));
      setStudentsByClass(prev => {
        const next = { ...prev };
        delete next[classId];
        return next;
      });
      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      setError(getErrorMessage(error, 'خطأ في حذف القسم'));
      return false;
    }
  }

  const importClasses = async function (classesData: { name: string, level: string, students: Omit<Student, '_id'>[] }[]): Promise<boolean> {
    setError(null);
    try {
      await axios.post('/api/classes/import', { classes: classesData });
      fetchClasses();
      return true;
    } catch (error) {
      console.error('Error adding class:', error);
      setError(getErrorMessage(error, 'خطأ في استيراد الأقسام'));
      return false;
    }
  }

  // handle students

  const refreshStudents = async (classId: string) => {
    try {
      const response = await axios.get(`/api/classes/${classId}/students`);
      setStudentsByClass(prev => ({ ...prev, [classId]: response.data.students }));
    } catch (error) {
      console.error('Error refreshing students:', error);
      setError(getErrorMessage(error, 'خطأ في تحديث الطلاب'));
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
      setError(getErrorMessage(error, 'خطأ في تحميل الطلاب'));
    } finally {
      setLoadingStudents(prev => ({ ...prev, [classId]: false }));
    }
  }

  const addStudent = async function (classId: string, studentData: Omit<Student, '_id'>): Promise<boolean> {
    setError(null);
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
      return true;
    } catch (error) {
      console.error('Error adding student:', error);
      setError(getErrorMessage(error, 'خطأ في إضافة الطالب'));
      return false;
    }
  }

  const deleteStudent = async function (classId: string, studentId: string): Promise<boolean> {
    setError(null);
    try {
      await axios.delete(`/api/classes/${classId}/students/${studentId}`);
      setStudentsByClass(prev => {
        const next = { ...prev };
        if (classId in next) {
          next[classId] = next[classId].filter(s => s._id !== studentId);
        }
        return next;
      });
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(getErrorMessage(error, 'خطأ في حذف الطالب'));
      return false;
    }
  }

  const updateStudent = async function (classId: string, studentId: string, studentData: Partial<Omit<Student, '_id'>>): Promise<boolean> {
    setError(null);
    try {
      const response = await axios.patch(`/api/classes/${classId}/students/${studentId}`, { studentId, ...studentData });
      setStudentsByClass(prev => {
        const next = { ...prev };
        if (classId in next) {
          next[classId] = next[classId].map(s => s._id === studentId ? response.data.student : s);
        }
        return next;
      });
      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      setError(getErrorMessage(error, 'خطأ في تعديل الطالب'));
      return false;
    }
  }

  return {
    classes, loading, fetchClasses, fetchStudents,
    studentsByClass, loadingStudents, refreshStudents, importClasses,
    addClass, deleteClass, addStudent, deleteStudent, updateStudent,
    error, clearError: () => setError(null)
  };
}