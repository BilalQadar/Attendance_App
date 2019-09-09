const firebaseConfig = {
	//lmao nice try though
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.getElementById("submit").addEventListener("click", function(){
  //Change the password below every week!
  const password101 = "abc";
  const password102 = "123";
  
  var firstname = document.getElementById("firstname").value;
  var lastname = document.getElementById("lastname").value;
  var studentNum = document.getElementById("studentNum").value;
  var password = document.getElementById("password").value;
  var lectureSection = document.getElementById("sectionOptions").value;
  var date = new Date();

  var validI = validInputs(studentNum,firstname,lastname,lectureSection,password);
  var validT = validTime(lectureSection,date);

  if (validI == true && validT == true){
    if(lectureSection == "LEC 0101"){
      var validP = validPassword(password101,password);
    }
    else if(lectureSection == "LEC 0102"){
      var validP = validPassword(password102, password);
    }

    if (validP == true){
      handleData(studentNum,firstname,lastname,lectureSection,date);
    }
  }
});

function validInputs(studentNum,firstname,lastname,lectureSection,password){
  const lecturePH = document.getElementById("lectureError");
  const numPH = document.getElementById("numError");
  const firstPH = document.getElementById("firstnameError");
  const lastPH = document.getElementById("lastnameError");
  const passwordPH = document.getElementById("passwordError");
  const genericPH = document.getElementById("genericError");
  allValid = true;

  if(studentNum == ""){
    allValid = false;
    numPH.innerHTML = "Enter your student number";
  }
  else{
    numPH.innerHTML  = "";
  }
  if(firstname == ""){
    allValid = false;
    firstPH.innerHTML = "Enter your first name";
  }
  else{
    firstPH.innerHTML = "";
  }
  if(lastname == ""){
    allValid = false;
    lastPH.innerHTML = "Enter your last name";
  }
  else{
    lastPH.innerHTML = "";
  }
  if(lectureSection == "None"){
    allValid = false;
    lecturePH.innerHTML = "Enter a valid lecture section";
  }
  else{
    lecturePH.innerHTML = "";
  }
  if(password == ""){
    allValid = false;
    passwordPH.innerHTML = "Enter a valid password";
  }
  else{
    passwordPH.innerHTML = "";
  }
  return allValid;
}

function validTime(lectureSection,date){
  const genericPH = document.getElementById("genericError")
  const lectureDays = [3,5];
  const lecture1_start = [9,9];
  const lecture2_start = [13,14];
  const loginRange = [0,20];

  day = date.getDay();
  hour = date.getHours();
  minutes = date.getMinutes();

  if (lectureSection == "LEC 0101"){
    if(day == lectureDays[0] && hour == lecture1_start[0] && minutes > loginRange[0] && minutes < loginRange[1]){
      return true;
    }
    else if(day == lectureDays[1] && hour == lecture1_start[1] && minutes > loginRange[0] && minutes < loginRange[1]){
      return true;
    }
    else {
      genericPH.innerHTML = "Sign in window closed";
      return false;

    }
  }

  if (lectureSection == "LEC 0102"){
    if(day == lectureDays[0] && hour == lecture2_start[0] && minutes > loginRange[0] && minutes < loginRange[1]){
      return true;
    }
    else if(day == lectureDays[1] && hour == lecture2_start[1] && minutes > loginRange[0] && minutes < loginRange[1]){
      return true;
    }
    else {
      genericPH.innerHTML = "Sign in window closed";
      return false;
    }
  }
}

function validPassword(classPassword, password){
  if(classPassword == password){
    return true;
  }
  else {
    return false;
  }
}

function handleData(studentNum, firstname, lastname, lectureSection,date) {
  const root = firebase.database().ref();
  const users = root.child("users");

  users.once("value", function(snapshot){
    var exists = snapshot.hasChild(studentNum);
    if (exists == false){
      newUser(studentNum, firstname,lastname,lectureSection,date);
    }
    else {
      returningUser(studentNum,firstname,lastname,lectureSection,date);
    }
  });
}

function newUser(studentNum,firstname,lastname,lectureSection,date){
  const successPH = document.getElementById("success");
  const root = firebase.database().ref();
  const users = root.child("users");
  const session = date.getDate();
  successPH.innerHTML = "Successfully signed in!";
  users.child(studentNum).set({
    studentNumber: studentNum,
    lectureSection: lectureSection,
    firstname: firstname,
    lastname: lastname,
    classes_attended: 1,
    lastActive: session
  });

  setTimeout(function(){
    location.reload();
  }, 2000);
}

function returningUser(studentNum,firstname,lastname,lectureSection,date){
  const successPH = document.getElementById("success");
  const root = firebase.database().ref();
  const users = root.child("users");
  const studentChild = users.child(studentNum)
  const attendedChild = studentChild.child("classes_attended");
  const prevSession = studentChild.child("lastActive");
  const session = date.getDate();
  const genericPH = document.getElementById("genericError");

  prevSession.once("value", function(snapshot){
    var lastActive = snapshot.val();
    if(lastActive != date.getDate()){
      successPH.innerHTML = "Successfully signed in!";
      attendedChild.once("value", function(snapshot){
        var classes = snapshot.val() + 1;
        users.child(studentNum).set({
          studentNumber: studentNum,
          lectureSection: lectureSection,
          firstname: firstname,
          lastname: lastname,
          classes_attended: classes,
          lastActive: session
        });
      });

      setTimeout(function(){
        location.reload();
      }, 2000);
    }

    else {
      genericPH.innerHTML = "Error: Already marked present";
    }
  });
}
