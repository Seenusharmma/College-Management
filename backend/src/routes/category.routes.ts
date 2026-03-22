import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'cs', name: 'Computer Science' },
      { id: 'ec', name: 'Electronics & Communication' },
      { id: 'ee', name: 'Electrical Engineering' },
      { id: 'me', name: 'Mechanical Engineering' },
      { id: 'ce', name: 'Civil Engineering' },
      { id: 'it', name: 'Information Technology' }
    ]
  });
});

router.get('/semesters', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Semester 1' },
      { id: 2, name: 'Semester 2' },
      { id: 3, name: 'Semester 3' },
      { id: 4, name: 'Semester 4' },
      { id: 5, name: 'Semester 5' },
      { id: 6, name: 'Semester 6' },
      { id: 7, name: 'Semester 7' },
      { id: 8, name: 'Semester 8' }
    ]
  });
});

router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'notes', name: 'Notes' },
      { id: 'assignments', name: 'Assignments' },
      { id: 'pyqs', name: 'Previous Year Questions' },
      { id: 'events', name: 'Events' },
      { id: 'jobs', name: 'Jobs & Internships' },
      { id: 'other', name: 'Other' }
    ]
  });
});

export const categoryRoutes = router;
