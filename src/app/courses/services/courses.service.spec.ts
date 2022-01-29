import { TestBed } from "@angular/core/testing";
import { CoursesService } from "./courses.service";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import { Course } from "../model/course";
import { HttpErrorResponse } from "@angular/common/http";

describe('CoursesService', () => {

  let coursesService: CoursesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CoursesService,
      ]
    });

    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('Should retrive all courses', () => {
    coursesService.findAllCourses()
      .subscribe((courses) => {
        expect(courses).toBeTruthy('No courses returned');
        expect(courses.length).toBe(12, 'Incorrect number of courses');
        const course = courses.find((course) => course.id == 12);
        expect(course.titles.description).toBe('Angular Testing Course');
      });

    const req = httpTestingController.expectOne('/api/courses');
    expect(req.request.method).toBe('GET');
    req.flush({ payload: Object.values(COURSES) });
  });

  it('should retrive a course by id', () => {
    coursesService.findCourseById(12)
      .subscribe((course) => {
        expect(course).toBeTruthy();
        expect(course.id).toBe(12);
      });

    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toBe('GET');
    req.flush(COURSES[12]);
  });

  it('should save the course data', () => {
    const changes: Partial<Course> = {
      titles: {
        description: 'Testing Course'
      }
    };

    coursesService.saveCourse(12, changes)
      .subscribe((course) => {
        expect(course.id).toBe(12);
      });

    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.titles.description).toBe('Testing Course');

    req.flush({
      ...COURSES[12],
      ...changes
    });
  });

  it('should give an error if save course fail', () => {
    const changes: Partial<Course> = {
      titles: {
        description: 'Testing Course'
      }
    };

    coursesService.saveCourse(12, changes)
      .subscribe({
        next: () => fail('the save course operation should have failed'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
        }
      });

    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toBe('PUT');
    req.flush('Save course failed', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should find a list of leassons', () => {
    coursesService.findLessons(12)
    .subscribe((lessons) => {
      expect(lessons.length).toBe(3);
    });

    const req = httpTestingController.expectOne(req => req.url === '/api/lessons');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('courseId')).toBe('12');
    expect(req.request.params.get('filter')).toBe('');
    expect(req.request.params.get('sortOrder')).toBe('asc');
    expect(req.request.params.get('pageNumber')).toBe('0');
    expect(req.request.params.get('pageSize')).toBe('3');
    req.flush(findLessonsForCourse(12).slice(0, 3));
  });

  afterAll(() => {
    httpTestingController.verify();
  })

});
