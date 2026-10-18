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

// ---------------------------------------------------------------------------
// Shared in-memory cache (module level).
// Every page that calls useClasses() reads the same cache, so navigating
// between documents no longer re-downloads classes / students.
// It lives only in the open tab: a full page reload (F5) clears it.
// ---------------------------------------------------------------------------
let classesCache: Class[] | null = null;
let classesRequest: Promise<Class[]> | null = null;
const studentsCache: Record<string, Student[]> = {};
const studentsRequests: Record<string, Promise<Student[]> | undefined> = {};

// Call this on logout so another account on the same tab never sees old data.
export function clearClassesCache() {
  classesCache = null;
  classesRequest = null;
  for (const k of Object.keys(studentsCache)) delete studentsCache[k];
  for (const k of Object.keys(studentsRequests)) delete studentsRequests[k];
}

// Call this after changing students OUTSIDE this hook (e.g. AllNotes matricule patch):
// the next fetchStudents() for that class goes back to the server.
export function invalidateStudents(classId: string) {
  delete studentsCache[classId];
}

export const useClasses = () => {
  const [classes, setClassesState] = useState<Class[]>(() => classesCache ?? []);
  // true only if we really have to load the classes on mount
  const [loading, setLoading] = useState(() => classesCache === null);
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({});
  const [studentsByClass, setStudentsState] = useState<Record<string, Student[]>>(() => ({ ...studentsCache }));
  const [error, setError] = useState<string | null>(null);

  // setters that keep the shared cache in sync.
  // The cache is the source of truth, so a page with an older copy
  // can never overwrite newer data written by another page.
  const setClasses = (fn: (prev: Class[]) => Class[]) => {
    const next = fn(classesCache ?? classes);
    classesCache = next;
    setClassesState(next);
  };

  // undefined = remove that class from the cache
  const putClassStudents = (classId: string, list: Student[] | undefined) => {
    if (list === undefined) delete studentsCache[classId];
    else studentsCache[classId] = list;
    setStudentsState(prev => {
      const next = { ...prev };
      if (list === undefined) delete next[classId];
      else next[classId] = list;
      return next;
    });
  };

  const currentStudents = (classId: string): Student[] | undefined =>
    studentsCache[classId] ?? studentsByClass[classId];

  // handle classes

  // Pure fetch — no setState here. Concurrent callers share one request.
  const getClassesData = async (): Promise<Class[]> => {
    if (!classesRequest) {
      classesRequest = axios.get('/api/classes')
        .then(response => response.data.classes as Class[])
        .finally(() => { classesRequest = null; });
    }
    return classesRequest!;
  }

  // Public refetch helper (after import, or a manual "refresh" button).
  // Always hits the server.
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getClassesData();
      setClasses(() => data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError(getErrorMessage(error, 'خطأ في تحميل الأقسام'));
    } finally {
      setLoading(false);
    }
  }

  // Initial load on mount — skipped when the classes are already cached.
  useEffect(() => {
    if (classesCache !== null) return;
    let ignore = false;

    getClassesData()
      .then((data) => {
        classesCache = data;
        if (!ignore) setClassesState(data);
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
      putClassStudents(classId, undefined);
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
      // an import can add students to existing classes: drop the cached lists
      for (const k of Object.keys(studentsCache)) delete studentsCache[k];
      setStudentsState({});
      fetchClasses();
      return true;
    } catch (error) {
      console.error('Error adding class:', error);
      setError(getErrorMessage(error, 'خطأ في استيراد الأقسام'));
      return false;
    }
  }

  // handle students

  // Always hits the server (manual refresh).
  const refreshStudents = async (classId: string) => {
    try {
      const response = await axios.get(`/api/classes/${classId}/students`);
      putClassStudents(classId, response.data.students);
    } catch (error) {
      console.error('Error refreshing students:', error);
      setError(getErrorMessage(error, 'خطأ في تحديث الطلاب'));
    }
  }

  // Uses the shared cache: a class already loaded on any page is not re-downloaded.
  const fetchStudents = async (classId: string) => {
    if (classId in studentsCache) {
      if (!(classId in studentsByClass)) {
        setStudentsState(prev => ({ ...prev, [classId]: studentsCache[classId] }));
      }
      return;
    }
    if (classId in studentsByClass) return;

    setLoadingStudents(prev => ({ ...prev, [classId]: true }));
    try {
      if (!studentsRequests[classId]) {
        studentsRequests[classId] = axios.get(`/api/classes/${classId}/students`)
          .then(response => response.data.students as Student[])
          .finally(() => { delete studentsRequests[classId]; });
      }
      const students = await studentsRequests[classId]!;
      putClassStudents(classId, students);
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
      const base = currentStudents(classId);
      putClassStudents(classId, base ? [...base, response.data.student] : [response.data.student]);
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
      const base = currentStudents(classId);
      if (base) putClassStudents(classId, base.filter(s => s._id !== studentId));
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
      const base = currentStudents(classId);
      if (base) putClassStudents(classId, base.map(s => s._id === studentId ? response.data.student : s));
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