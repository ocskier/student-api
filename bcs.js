require('dotenv').config();
const axios = require('axios');
const { printTable } = require('console-table-printer');

const init = async () => {
  try {
    const authRes = await axios.post(
      'https://bootcampspot.com/api/instructor/v1/login',
      JSON.stringify({
        email: process.env.USER_NAME,
        password: process.env.PASSWD,
      })
    );
    const { data: grades } = await axios.post(
      'https://bootcampspot.com/api/instructor/v1/grades',
      JSON.stringify({
        courseId: process.env.COURSE_ID,
      }),
      {
        headers: {
          authToken: authRes.data.authenticationInfo.authToken,
          'Content-Type': 'application/json',
        },
      }
    );
    let filteredGrades = grades
      .filter(
        (grade, i) =>
          !(
            grade.assignmentTitle.includes('Career') ||
            grade.assignmentTitle.includes('Milestone')
          )
      )
      .map((grade) => {
        return {
          ...grade,
          assignmentTitle:
            grade.assignmentTitle === 'Project 1'
              ? '7: ' + grade.assignmentTitle
              : grade.assignmentTitle === 'Updated Portfolio Page'
              ? '8: ' + grade.assignmentTitle
              : grade.assignmentTitle === 'Project 2'
              ? '15: ' + grade.assignmentTitle
              : grade.assignmentTitle === 'Updated Portfolio Page #2'
              ? '16: ' + grade.assignmentTitle
              : grade.assignmentTitle === 'Project 3'
              ? '22: ' + grade.assignmentTitle
              : grade.assignmentTitle,
        };
      });
    filteredGrades.sort(function (a, b) {
      const assignmentNumA = parseInt(a.assignmentTitle.split(':')[0]);
      const assignmentNumB = parseInt(b.assignmentTitle.split(':')[0]);
      return assignmentNumA - assignmentNumB;
    });
    let filteredAssns = filteredGrades.reduce(
      (acc, grade) =>
        acc.indexOf(grade.assignmentTitle) === -1
          ? [...acc, grade.assignmentTitle]
          : [...acc],
      []
    );
    let filteredNames = filteredGrades.reduce(
      (acc, grade) =>
        acc.indexOf(grade.studentName) === -1
          ? [...acc, grade.studentName]
          : [...acc],
      []
    );
    let flippedTable = [];
    for (let i = 0; i < 33; i++) {
      flippedTable.push({
        Name: filteredNames[i],
        ...Object.fromEntries([
          ...new Map(
            filteredAssns
              .map((assn, j) => {
                return [
                  String(j),
                  filteredGrades[i + j * 33].grade === 'Incomplete'
                    ? 'I'
                    : filteredGrades[i + j * 33].grade,
                ];
              })
              .slice(1)
          ),
        ]),
      });
    }
    printTable(flippedTable);
  } catch (err) {
    console.log(err);
  }
};

init();
