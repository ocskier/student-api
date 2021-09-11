# bcs-api
Interacting with the BootcampSpotAPI for educational purposes

## Google Script

```javascript
function myFunction() {
  const numStudents = 48;
  async function init () {
    try {
      const authRes = UrlFetchApp.fetch('https://bootcampspot.com/api/instructor/v1/login',{
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        payload: JSON.stringify({
          email: "youremail@instructors.2u.com",
          password: "yourbcspassword",
        })}
      );
      const authInfo = JSON.parse(authRes.getContentText());
      const gradesRes = UrlFetchApp.fetch('https://bootcampspot.com/api/instructor/v1/grades',{
        method: "POST",
        headers: {
          authToken: authInfo.authenticationInfo.authToken,
          'Content-Type': 'application/json',
        },
        payload: JSON.stringify({
          courseId: 0000,
        }), 
      });
      const grades = JSON.parse(gradesRes.getContentText());
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
      for (let i = 0; i < numStudents; i++) {
        flippedTable.push({
          Name: filteredNames[i],
          ...Object.fromEntries([
            ...new Map(
              filteredAssns
                .map((assn, j) => {
                  return [
                    String(j),
                    filteredGrades[i + j * numStudents].grade === 'Incomplete'
                      ? 'I'
                      : filteredGrades[i + j * numStudents].grade,
                  ];
                })
                .slice(1)
            ),
          ]),
        });
      }
      const colHeadingsArr = Object.keys(flippedTable[0]);
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Beta-Grades").getRange(3, 1, 100, colHeadingsArr.length).clearContent();
      // SpreadsheetApp.getSheetByName("Beta-Grades").getRange(1, 1, 1, colHeadingsArr.length).setValues([[colHeadingsArr[colHeadingsArr.length-1],...colHeadingsArr.slice(0,colHeadingsArr.length-1)]]);
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Beta-Grades").getRange(3, 1, numStudents, colHeadingsArr.length).setValues(flippedTable.map(student=>[Object.entries(student).map(entry=>entry[1])[Object.entries(student).map(entry=>entry[1]).length-1],...Object.entries(student).map(entry=>entry[1]).slice(0,Object.entries(student).map(entry=>entry[1]).length-1)]));
    } catch (err) {
      console.log(err);
    }
  };

  init();
}

```javascript
