// MM/DD/YYYY ==> YYYY-MM-DD
function convertDate(dateStr){ 
  var dateArr = dateStr.split("/");
  // Kendo UI Calendar 的日期是類似 2/9/2020，月和日不會補0
  //if (dateArr[0].length ==1) dateArr[0]= "0"+dateArr[0];
  //if (dateArr[1].length ==1) dateArr[1]= "0"+dateArr[1];
  return dateArr[2]+"-"+dateArr[0]+"-"+dateArr[1];
}

// 設定 $a enabled 或 disabled
function setEnabled($a, Enabled ){
  $a.each(function(i, a){          
    var en = a.onclick !== null;        
    if(en == Enabled)return;
    if(Enabled){
      a.onclick = $(a).data('orgClick');            
    }
    else
    {
      $(a).data('orgClick',a.onclick);
      a.onclick = null;
    }
  });
}

function 取得經緯度() {
  navigator.geolocation.getCurrentPosition(function (position) {
    console.log(position.coords.latitude, position.coords.longitude);
    目前位置緯度 = Math.floor(position.coords.latitude * 10000) / 10000;
    目前位置經度 = Math.floor(position.coords.longitude * 10000) / 10000;
    $("#deleteMe").text("所在位置 緯度: " + String(目前位置緯度) + ", 經度: " + String(目前位置經度));
  });
}

// 計算 兩點 間的距離
function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371000; // meter
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}

function readCourses(){
  console.log("call API to Read Database");
  userName = decodeURI(displayName[1]);

  var checkDataReady = setInterval(function(){ 
    //console.log("aaa", allDataReady);
    if (allDataReady==4) {
      clearInterval(checkDataReady);
      //console.log("Data is ready", courseData);
      //alert("Data is ready");
      $.loading.end();
      notInCourse=[];
      inCourse=[];
      myHistory=[];     
      var attended=false;
      var isNow=false;
      var inHistory=false; 
      courseMember.forEach(function(course, index, array){  
        attended = false;        
        for (var i=1; i<course.length;i++) {
          if (course[i][3] == userId[1]) {              
            //console.log(course[0],userName, "已參加")
            attended = true;
          }
        };

        isNow = false;
        courseData.forEach(function(newCourse, index, array){
          if (newCourse[0]==course[0]) isNow = true; 
        });

        inHistory = false;
        courseHistory.forEach(function(oldCourse, index, array){
          if (oldCourse[0]==course[0]) inHistory = true; 
        });

        if (!attended && isNow)     notInCourse.push(course[0]);
        if (attended  && isNow)     inCourse.push(course[0]);        
        if (attended  && inHistory) myHistory.push(course[0]);
      });
      //addCourseCards();
    }
  }, 100);

  $.loading.start('讀取資料');
  allDataReady = 0;
  getDataByAPIs(checkDataReady);    

};

function getDataByAPIs(checkDataReady) {
  var request1, reuquest2, request3, request4;
  // call API:10 =========================================================================
  paramToSend = "?API=10";      
  request1 = new XMLHttpRequest()
  if (useLocalAPIs) {
    request1.open('GET', 'http://localhost:5000' + paramToSend, true);
  } else {
    request1.open('GET', apiSite +paramToSend, true);
  }

  request1.onload = function() {
    var responseMsg = this.response;

    //responseMsg="API:10 courseData 讀取失敗"; //故意測試錯誤
    if (responseMsg != "API:10 courseData 讀取失敗") {
      courseData = JSON.parse(this.response);
      //console.log(courseData);
      allDataReady++;
      request2.send();
    } else {
      clearInterval(checkDataReady); 
      //$.loading.end();
      alert("課程資料讀取失敗，請稍後再試，或洽櫃台人員");
    }

  }
  // Send request
  request1.send();
  // =====================================================================================      

  // call API:11 =========================================================================
  paramToSend = "?API=11";      
  request2= new XMLHttpRequest()
  if (useLocalAPIs) {
    request2.open('GET', 'http://localhost:5000' + paramToSend, true);
  } else {
    request2.open('GET', apiSite +paramToSend, true);
  }

  request2.onload = function() {
    var responseMsg = this.response;

    //responseMsg="API:11 courseHistory 讀取失敗"; //故意測試錯誤        
    if (responseMsg != "API:11 courseHistory 讀取失敗") {
      courseHistory = JSON.parse(this.response);
      //console.log(courseHistory);
      allDataReady++;
      request3.send();          
    } else {
      clearInterval(checkDataReady);
      //$.loading.end();
      alert("課程歷史讀取失敗，請稍後再試，或洽櫃台人員");
    }

  }
  // =====================================================================================      
  
  // call API:12 =========================================================================
  paramToSend = "?API=12";      
  request3 = new XMLHttpRequest()
  if (useLocalAPIs) {
    request3.open('GET', 'http://localhost:5000' + paramToSend, true);
  } else {
    request3.open('GET', apiSite +paramToSend, true);
  }

  request3.onload = function() {
    var responseMsg = this.response;

    //responseMsg="API:12 courseMember 讀取失敗"; //故意測試錯誤         
    if (responseMsg != "API:12 courseMember 讀取失敗") {
      courseMember = JSON.parse(this.response);
      //console.log(courseMember);
      allDataReady++;
      request4.send();
    } else {
      clearInterval(checkDataReady);
      //$.loading.end();
      alert("課程報名資料讀取失敗，請稍後再試，或洽櫃台人員");
    }

  }
  // ===================================================================================== 
 
  // call API:13 =========================================================================
  paramToSend = "?API=13&"+"UserId="+userId[1];      
  request4 = new XMLHttpRequest()
  if (useLocalAPIs) {
    request4.open('GET', 'http://localhost:5000' + paramToSend, true);
  } else {
    request4.open('GET', apiSite +paramToSend, true);
  }

  request4.onload = function() {
    var responseMsg = this.response;

    //responseMsg="API:13 courseMember 讀取失敗"; //故意測試錯誤         
    if (responseMsg.substr(0,6) != "API:13") {
      userPhoneNumber = responseMsg;
      allDataReady++;         
    } else {
      clearInterval(checkDataReady);
      //$.loading.end();
      alert("客戶資料讀取失敗，請稍後再試，或洽櫃台人員");
    }

  }
  // =====================================================================================      
}

//async function 更新資料() {
//  console.log("更新資料");
// 
//  var isOK = await 註冊會員();
//  console.log(已經是會員);
//
////  if (!已經是會員) {
////    loadCourses = true;
////    getCourseData(navDataSource);
////    取得量測記錄(measurementSource);      
////  }
//  
//  if (isOK) app.navigate('#:back');
//}

// 非同步+await
function callAPI(param, loadingMessage) {
  return new Promise(function(resolve, reject) {       
    var request = new XMLHttpRequest();
    request.open('GET', apiSite +param, true);

    request.onload = function() {
      if (loadingMessage!="") $.loading.end();
      //console.log(this.response);

      resolve(this.response);
    }
    // Send API request 
    if (loadingMessage!="") $.loading.start(loadingMessage);

    request.send();    
  });
}

async function checkUserIdExist() {
  //Call API:00 檢查 userId 有沒有重複參加 */

  $.loading.start('檢查是否已填寫查詢資料');
  paramToSend = "?API=14" + "&UserId=" + userId[1];
  var res = await callAPI(paramToSend, '檢查是否已填寫查詢資料');
  
  console.log(typeof res, res);
  
  if (res.substring(0,6) == "API:14") {
    alert("為查詢資料，請填寫必要資料");
//    $("#formMemberName").val(decodeURI(displayName[1]));
//    $("#formMemberName").attr("disabled", "disabled"); 
//    $("#LINE頭像").attr("src", pictureUrl[1]);
    已經是會員 = false;
    app.navigate('#forms');
    
  } else {
    console.log("已經是會員");
    已經是會員 = true;
    
    userProfile = JSON.parse(res);
    console.log(userProfile);

    $("#formMemberUnit").val(userProfile.服務單位);
    $("#formMemberID").val(userProfile.查詢編號);
    $("#formMemberName").val(userProfile.查詢姓名);
    $("#formMemberBirth").val(userProfile.查詢生日);
    
//    $("#formMemberName").val(userProfile[0]);
//    $("#formUserGender").val(userProfile[1]);     
//    $("#formMemberBirth").val(userProfile[2]);
//    $("#formUserPhone").val(userProfile[3]);
//    $("#formMemberID").val(userProfile[4]);
//    $("#formUserAddr").val(userProfile[5]);
//    $("#formUserHeight").val(userProfile[8]);
//    $("#formUserWeight").val(userProfile[9]);    
    
//    // formEmergencyContact 挪來用為 formUserEthnicity
//    $("#formUserEthnicity").val(userProfile[10]);
//    
//    // formEmergencyPhone 挪來用為 常用預設健身房
//    //預設常用健身房 = (userProfile[11]=="undefined")? "永和店":userProfile[11];
//    //$("#預設常用健身房").val(預設常用健身房); 
//    客戶名稱 = "即刻體能"; // 需與 Firebase 上名稱一致
//    預設常用健身房 ="即刻店";
//      
//    $("#LINE頭像").attr("src", userProfile[7]);
//    
//    // 讀取店面名稱和機器序號
//    paramToSend = "?API=30" + "&CustomerId=" + 客戶名稱;
//    var res = await callAPI(paramToSend, '讀取店面名稱');
//    店面名稱 = JSON.parse(res);
//    console.log(店面名稱);
//
//    // Append 店面名稱到個人資料中 預設常用健身房 選項
//    for (var i=0; i< 店面名稱.length; i++){
//      $("#預設常用健身房").append("<option value='"+店面名稱[i]+"'>"+店面名稱[i]+"</option>");
//    } 
//    
//    $("#預設常用健身房").val(預設常用健身房); 
//
//    paramToSend = "?API=31" + "&CustomerId="+客戶名稱+"&StoreId="+預設常用健身房;      
//    var res = await callAPI(paramToSend, '讀取店面名稱');
//    var machineStatus = res.split(",");
//    機器序號 = machineStatus[0];
//    console.log(機器序號);    
    
    paramToSend = "?API=32" + "&UserId=" + $("#formMemberID").val(); //userId[1];
    var res = await callAPI(paramToSend, '讀取量測記錄');
    console.log(typeof res, res);
    
    var 所有量測數據=JSON.parse(res);
    console.log(所有量測數據);    
    
    var records = Object.keys(所有量測數據).sort().reverse();
    
    var dataTemp=[];    
    for (var i=0; i < records.length; i++){
      
      var 量測記錄 = 所有量測數據[records[i]];
      console.log(量測記錄.timestamp, 量測記錄.weight);
      
      var 時間Date = new Date(量測記錄.timestamp);
      var 時間Str  = 時間Date.toLocaleString();   
      console.log("時間Str", 時間Str);      
      var 卡片 = {
        "量測記錄時間": 時間Str, //所有量測數據[i].量測時間,              
        "體重":    量測記錄.weight,
        "身高":    量測記錄.height,
        "BMI":    量測記錄.BMI,
        "量測紀錄圖片": "",              
        "url": "",
        "section": "A"             
      };
      dataTemp.push(卡片);       
    }

//    var dataTemp=[];
//    for (var i=0; i<所有量測數據.length; i++ ) {
//      var 時間Date = new Date(所有量測數據[i].量測時間);
//      var 時間Str  = 時間Date.toLocaleString();   
//      console.log("時間Str", 時間Str);      
//      var 卡片 = {
//        "量測記錄時間": 時間Str, //所有量測數據[i].量測時間,              
//        "綜合評價":    所有量測數據[i].HealthScore,
//        "量測紀錄圖片": 所有量測數據[i].PicUrl,              
//        "url": "2-views/量測報告.html?PicUrl="+所有量測數據[i].PicUrl,
//        "section": "A"             
//      };
//      dataTemp.push(卡片); 
//    }
    
    console.log(dataTemp.length, dataTemp);
    measurementSource.success(dataTemp);
    console.log(dataTemp.length);
    
    if (dataTemp.length==0) {
      $("#量測記錄title").text("尚無量測記錄");
    }else {
      $("#量測記錄title").text("量測記錄");
    }     
       
    refresh=true;
    measurementSource.read(); // 產生 sorting 
    $.loading.end();
    
//    loadCourses = true;
//    getCourseData(navDataSource);
//    取得量測記錄(measurementSource);    
  }
}

async function 註冊會員() {
  console.log("註冊會員");
  // 檢查資料格式     
  if (   $("#formMemberName").val()        == ""
      || $("#formMemberBirth").val()        == ""
      || $("#formMemberID").val()           == ""      
      //|| $("#formUserGender").val()       == ""
      //|| $("#formUserPhone").val()        == ""
      //|| $("#formUserHeight").val()       == ""
      //|| $("#formUserWeight").val()       == ""       
      //|| $("#formEmergencyContact").val() == ""
      //|| $("#formEmergencyPhone").val()   == ""          
     ) {
    alert("請填寫必填項目!");
    console.log("缺必填項目")
    return false;
  }
  
  // Brithday 格式 YYYY-MM-DD
  var regex_birthday = /^[1-2][0-9]{3}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!regex_birthday.test($("#formMemberBirth").val())){
    alert("出生年月格式錯誤!");
    console.log("birthday format is wrong");
    return false;
  }
  console.log("birthday format is correct");
  
  
  // Brithday 限制前ㄧ年 到 前 100 年  
//  var dateNow = new Date();
//  var thisYear = parseInt( dateNow.toLocaleDateString().substr(0,4));
//  var birthYear = parseInt($("#formMemberBirth").val().substr(0,4));
//  console.log(thisYear, birthYear);
//  if ( (birthYear>= (thisYear)) || (birthYear < (thisYear-100)) ){
//    alert("出生年必須在 "+ (thisYear-100).toString()+ "~"+ (thisYear).toString()+ " 之間!");
//    console.log("birthday year is out of range");
//    return false;
//  }
//  console.log("birthday year is in range");
  
  // 身高限制 50 cm ~ 300cm
//  var regex_height = /^[1-9][0-9]{1,2}$/g;
//  var regex_height = /^[1-9][0-9]{1,2}(\.\d{0,2})?$/g;
//  if (!regex_height.test($("#formUserHeight").val())){
//    alert("身高格式錯誤!");
//    console.log("Height format is wrong");
//    return false;    
//  }
//
//  var userHeight = parseFloat($("#formUserHeight").val());
//  console.log(userHeight);
//  if ( userHeight<50 || userHeight > 300) {
//    alert("身高必須在 50cm ~ 300cm 之間!");
//    console.log("Height is out of range");
//    return false;    
//  }
  
  
  var APIToCall = (已經是會員)?  "?API=02":"?API=01"
  paramToSend = APIToCall +
    "&Name="             + $("#formMemberName").val() +
    "&Gender="           + $("#formUserGender").val() +     
    "&Birth="            + $("#formMemberBirth").val() +
    "&Phone="            + $("#formUserPhone").val() +
    "&ID="               + $("#formMemberID").val() +
    "&Address="          + $("#formUserAddr").val() +
    "&UserId="           + userId[1] +        
    "&PicURL="           + pictureUrl[1] +       
    "&Height="           + $("#formUserHeight").val()+
    "&Weight="           + $("#formUserWeight").val()+        
    "&EmergencyContact=" + $("#formUserEthnicity").val()+  // 挪來用為 Ethnicity
    "&EmergencyPhone="   + $("#預設常用健身房").val();       // 挪來用為 常用預設健身房     
  
  console.log(paramToSend); 

  var profile = "請確認會員資料:\n" +
    "    預設常用健身房: " + $("#預設常用健身房").val() + "\n" +      
    "    會員姓名: " + $("#formMemberName").val() + "\n" +
    "    會員姓別: " + $("#formUserGender").val() + "\n" +
    "    會員生日: " + $("#formMemberBirth").val() + "\n" +  
    "    區域: "    + $("#formUserEthnicity").val() + "\n" +        
    "    會員身高: " + $("#formUserHeight").val() + " cm" +"\n" +          
//    "    會員體重: " + $("#formUserWeight").val() + " kg" +"\n" +            
    "    會員電話: " + $("#formUserPhone").val() + "\n";
//    "    身分證號: " + $("#formMemberID").val() + "\n" +
//    "    會員地址: " + $("#formUserAddr").val() + "\n" +
//    "    緊急聯絡人:" + $("#formEmergencyContact").val() + "\n" +       
//    "    緊急聯絡電話:" + $("#formEmergencyPhone").val();        

  if (confirm(profile)) {
    // 寫入會員到 Direbase     
    var res = await callAPI(paramToSend, '寫入資料');

    if (res == "API:01 會員寫入成功" || res == "API:01 會員已存在" || "API:02 資料更新成功") {
      alert("資料更新成功，回到量測頁面");
      //$("#預設常用健身房標籤").text("未來健身 "+預設常用健身房); 
      $("#所在健身房說明").text("如果目前不在 "+預設常用健身房+ " ，請到個人資料(首頁右上角圖示)修改預設常用健身房，再回來測量。");
      checkUserIdExist();
      已經是會員 = true;
//      loadCourses = false;
      // 顯示團課表格
//      console.log("回到團課");
//      location.reload();
//      loadCourses = true;
//      getCourseData(navDataSource);

    } else {
      alert("資料新增失敗，請重試。若一直有問題，請洽管理員")
      $("#errorMessage").css("display", "block");
    }

  } else {
    console.log("Cancel");
  };
  
};

async function 更新資料() {
  console.log("更新資料");
  // 檢查資料格式     
  if (   $("#formMemberUnit").val()         == ""
      || $("#formMemberName").val()         == ""
      || $("#formMemberBirth").val()        == ""
      || $("#formMemberID").val()           == ""            
     ) {
    alert("請填寫必填項目!");
    console.log("缺必填項目")
    return false;
  }
  
  // Brithday 格式 YYYY-MM-DD
  var regex_birthday = /^[1-2][0-9]{3}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!regex_birthday.test($("#formMemberBirth").val())){
    alert("出生年月格式錯誤!");
    console.log("birthday format is wrong");
    return false;
  }
  console.log("birthday format is correct");
  
  console.log("進行更新會員資料");
  
  //?API=15&UserId=U8570ed5006325d504933612308d0fddf&Unit=醫院A&MemberID=ID00000001&MemberName=林X文&MemberBirthday=2021-08-01
  var APIToCall = "?API=15"
  paramToSend = APIToCall +
    "&UserId="           + userId[1] +
    "&Unit="             + $("#formMemberUnit").val() +
    "&MemberID="         + $("#formMemberID").val() +    
    "&MemberName="       + $("#formMemberName").val() +      
    "&MemberBirthday="   + $("#formMemberBirth").val();   
  
  console.log(paramToSend); 

  var profile = "請確認會員資料:\n" +
    "    服務單位: " + $("#formMemberUnit").val() + "\n" +     
    "    會員編號: " + $("#formMemberID").val()   + "\n" +      
    "    會員姓名: " + $("#formMemberName").val() + "\n" +
    "    會員生日: " + $("#formMemberBirth").val()+ "\n"; 
       
  console.log(profile); 
  if (confirm(profile)) {
    // 寫入會員到 Direbase     
    var res = await callAPI(paramToSend, '寫入資料');

    if (res == "更新資料庫成功") {
      alert("資料更新成功");
      checkUserIdExist();
      已經是會員 = true;
      app.navigate('#:back');
    } else {
      alert("資料更新失敗，請重試。若一直有問題，請洽管理員")
      $("#errorMessage").css("display", "block");
    }

  } else {
    console.log("Cancel");
  };
  
};

function checkInputParam() {
  console.log(inputParam);
  try {
    displayName = inputParam[0].split("=");
    userId = inputParam[1].split("=");
    pictureUrl = inputParam[2].split("=");
  } catch (e) {
    inputError = true;
  }

  console.log(displayName[1]);

  if (inputError) {
    alert("輸入參數錯誤");
    loadCourses = false;

    // 等 #mainDiv 顯示後，再 hide()
    setTimeout(function(){$("#mainDiv").hide();}, 500);

    $("#errorMessage").css("display", "block"); 
    return false;
  }
    return true;
}

function 切換量測頁面()
{
  console.log("切換量測頁面", this.selectedIndex);
  if(this.selectedIndex==0){
    $("#進行量測Div").show();
    $("#量測記錄Div").hide();
  } else {
    $("#進行量測Div").hide();
    $("#量測記錄Div").show();    
  }
}

function 顯示圖表() {
  console.log("顯示圖表");
  
  if (!已經是會員) {
    alert("為了更完整記錄您的量測資料，請先提寫資料，加入會員。謝謝!");
    app.navigate('#forms');
    return 1;
  }

  console.log("進行量測:"+預設常用健身房);
  app.navigate('2-views/進行量測.html');
}

function 顯示個人資料同意書() {
  console.log("顯示個人資料同意書");
  $("#QRscanBtn").hide();
  $("#formData").hide();
  $("#個人資料使用Div").hide();
  $("#個人資料同意書Div").show();
}

function 我知道了(){
  $("#QRscanBtn").show();
  $("#formData").show();
  $("#個人資料使用Div").show();  
  $("#個人資料同意書Div").hide();      
}


var ctx;
var myChartWeight;
function drawChart(){
    ctxW = $('#myChartWeight');
    myChartWeight = new Chart(ctxW, {
      type: 'bar',
      data: {
        labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        datasets: [{
          backgroundColor: [
            'rgba(255, 99, 132, 0.9)'
          ],
          label: '體重(公斤)',
          data: [null, null, null, null, 4.28, 4.75, null]
        }]
      }
    });      
  
    ctxH = $('#myChartHeight');
    myChartWeight = new Chart(ctxH, {
      type: 'bar',
      data: {
        labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        datasets: [{
          backgroundColor: [
            'rgba(99, 128, 64, 0.9)'
          ],
          label: '身高(公分)',
          data: [null, null, null, null, 53.5, 54.1, null]
        }]
      }
    });    
  
    ctxB = $('#myChartBMI');
    myChartWeight = new Chart(ctxB, {
      type: 'bar',
      data: {
        labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        datasets: [{
          backgroundColor: [
            'rgba(99, 128, 196, 0.9)'
          ],
          label: 'BMI          ',
          data: [null, null, null, null, 14.81, 16.22, null]
        }]
      }
    });
  
}

// update chart
// myChartWeight.data.datasets[0].data ==> [null, null, null, null, 4.28, 4.75, null]
// modify data, use myChartWeight.update()

function navBackToMain(){
//  if (html5QrCode!=undefined) html5QrCode.stop();
  console.log(html5QrCodeScanner)
  if (html5QrCodeScanner!="") { 
    console.log("clear");
    html5QrCodeScanner.clear();
  }
  $("#qr-div").hide(); 
  $("#QRscanBtn").show();
  $("#formData").show();
  $("#個人資料使用Div").show();   
}

function 關閉QR(){
//  if (html5QrCode!=undefined) html5QrCode.stop();
  console.log(html5QrCodeScanner)
  if (html5QrCodeScanner!="") { 
    console.log("clear");
    html5QrCodeScanner.clear();  
  }
  $("#qr-div").hide(); 
  $("#QRscanBtn").show();
  $("#formData").show();
  $("#個人資料使用Div").show();  
  
}

function 確認掃描資料(){
  console.log("確認掃描資料");
  if (  ($("#scanUnit").val()=="") ||
        ($("#scanID").val()=="")   ||
        ($("#scanName").val()=="") ||
        ($("#scanBirth").val()=="") 
     ) {
    alert("掃描資料不齊全，請再掃描一次!");
  } else {
    $("#formMemberUnit").val($("#scanUnit").val());
    $("#formMemberID").val($("#scanID").val());
    $("#formMemberName").val($("#scanName").val());
    $("#formMemberBirth").val($("#scanBirth").val()); 
    
    關閉QR();
  }
}

// branch "use custom html5QrCode" 使用 html5QrCode，但在 iPhone 6s plus 上畫面比例有點不對，考慮相容性問題，使用 html5QrCodeSanner
function onScanSuccess(decodedText, decodedResult) {
  // handle the scanned code as you like, for example:
  //console.log(`Code matched = ${decodedText}`, decodedResult);
  var scanInfo;
  try {
    scanInfo = JSON.parse(decodedText)
  } catch (e) {
    console.log(e);
    return
  }
  //console.log(scanInfo)
  $("#scanUnit").val(scanInfo.unit);
  $("#scanID").val(scanInfo.id);
  $("#scanName").val(scanInfo.name);
  $("#scanBirth").val(scanInfo.birth);
}
  

function onScanFailure(error) {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  //console.warn(`Code scan error = ${error}`);
}

var html5QrCodeScanner="";
function startQR(){
  console.log("start QR scanner");
  $("#QRscanBtn").hide();
  $("#formData").hide();
  $("#個人資料使用Div").hide();  
  $("#qr-div").show(); 
  
  html5QrCodeScanner = new Html5QrcodeScanner(
    "qr-reader",
    { fps: 10, qrbox: {width: 250, height: 250} },
    /* verbose= */ false);
  html5QrCodeScanner.render(onScanSuccess, onScanFailure);
}


/* use "use custom html5QrCode"
var html5QrCode;
function startQR(){
  console.log('start QR');
  
  $("#QRscanBtn").hide();
  $("#formData").hide();
  $("#個人資料使用Div").hide();
  
  var cameraId;
  var qrCodeSuccessCallback;
  var config;
  
  html5QrCode = new Html5Qrcode("qr-reader");

  qrCodeSuccessCallback = (decodedText, decodedResult) => {
      // handle success 
  };
  
  config = { fps: 10, qrbox: { width: 200, height: 200 } };    

  $.loading.start("啟動 Camera");
  Html5Qrcode.getCameras().then(devices => {
    // devices would be an array of objects of type: { id: "id", label: "label" }
    if (devices && devices.length) {
      for (var i=0; i< devices.length; i++){
        $("#availableCmeras").append("<option value="+i.toString()+">"+ devices[i].label+ "</option>");
      }
      cameraId = devices[1].id;
      console.log(devices, cameraId);
      $("#qr-div").show(); 
      $("#cameraSelect-div").hide();
      html5QrCode.start({ deviceId: { exact: cameraId} }, config, qrCodeSuccessCallback).then(()=>{
        $("#cameraSelect-div").show();
        $.loading.end();
      });    
      
    }
  }).catch(err => {
    // handle err
  });  
   
}
*/

function toISOStringWithTimeZone() {
    var nowDate = new Date();        
    var tzo = - nowDate.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };

    return nowDate.getFullYear() +
        '-' + pad(nowDate.getMonth() + 1) +
        '-' + pad(nowDate.getDate()) +
        'T' + pad(nowDate.getHours()) +
        ':' + pad(nowDate.getMinutes()) +
        ':' + pad(nowDate.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}

function testaaa(){
  console.log("aaa");
  alert("aaa");
}
