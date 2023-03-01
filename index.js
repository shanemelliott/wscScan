$(function () {
    var urlParams = new URLSearchParams(window.location.search);
    const codeReader = new ZXing.BrowserMultiFormatReader()
    const key=urlParams.get('key')
    const wscId = urlParams.get('external_id')
    const app=urlParams.get('app')
    const ver = urlParams.get('v')
    const name = urlParams.get('first_name')+' '+urlParams.get('last_name')
    $('#ver').html(ver.substring(0,3));
    const entries = urlParams.entries();
    var display=0
    if(urlParams.get('debug')){
        for(const entry of entries) {
          console.log(`${entry[0]}: ${entry[1]}`);
               $('#debug').prepend(`<p>${entry[0]}: ${entry[1]}<p>`); 
               $('#debug').show()
          }
    }
   
    $('#usrId').focus()
    let selectedDeviceId;
      
switch(app){
    case "staff":
        $('#scan').hide()
        $('#video').hide()
        $('#save').hide()
        $('#reset').hide()
        $('#man').hide()
        $('#usrId').hide()
        $('#usrId').val(wscId)

        var data = {
            'userID': wscId
            }
        $.ajaxSetup({
            headers : {
              'X-WSC-API-KEY' : key,
            }
        })
            $.ajax({
                type: 'POST',
                url: 'https://elliottcg.com/api/wsc/tests/checkone',
                data:JSON.stringify(data),
                contentType: 'application/json',
            }).then(function(data){
                //console.log(data);
                if(data.check===true){
                    $('#postResult').css({'display' : 'block', 'text-align' : 'left'});
                    $('#postResult').html('<p> '+name+' has already completed daily testing please click on close ');
                }else{
                    $('#save').show()
                    $('#postResult').css({'display' : 'block', 'text-align' : 'left'});
                    $('#postResult').html('<p> By Clicking save above, you are confirming that you, '+name+' have completed daily testing and do not have a positive result.  If you have a positive result please isolate in your room and call the medical room at 970-263-6223'); 
                }
            }).catch(function(error){
                console.log(error.responseJSON)
                $('#postResult').html(error.responseJSON.msg); 
            })
        break;
    case "test":
            //$('#save').show()
            $('#man').show()
            $('#reset').show()
            $('#scan').show()
            $('#video').show()
            console.log('ZXing code reader initialized')
            codeReader.listVideoInputDevices()
                .then((videoInputDevices) => {
                const sourceSelect = document.getElementById('sourceSelect')
                selectedDeviceId = videoInputDevices[0].deviceId
          if (videoInputDevices.length >= 1) {
                videoInputDevices.forEach((element) => {
                  const sourceOption = document.createElement('option')
                  sourceOption.text = element.label
                  sourceOption.value = element.deviceId
                  sourceSelect.appendChild(sourceOption)
            })

            sourceSelect.onchange = () => {
              selectedDeviceId = sourceSelect.value;
            };
            const sourceSelectPanel = document.getElementById('sourceSelectPanel')
            sourceSelectPanel.style.display = 'block'
       
            }
            
        })
        break;
     default:
        console.log("default")
        $('#postResult').html('<p> NDVWSC Covid Testing application. For more information, admin@wintersports.app<p>'); 
        break;
}



function sendData(usrId){
        var data = {
            'userID': usrId
            }
        console.log(data)
        $.ajaxSetup({
            headers : {
              'X-WSC-API-KEY' : key,
            }
        })
            $.ajax({
                type: 'POST',
                url: 'https://elliottcg.com/api/wsc/test',
                data:JSON.stringify(data),
                contentType: 'application/json',
            }).then(function(data){
                console.log(data);
                let result=data;
                if(result.type=="Self"){
                    console.log("self")
                    $('#postResult').html('Thank You for reporting, please click on close')
                    $('#save').hide()
                }
                $('#postResult').prepend('<p>'+result.msg+', '+result.id +', '+usrId+'</p>'); 
            }).catch(function(error){
                console.log(error.responseJSON)
                $('#postResult').html(error.responseJSON.msg); 
            })
}
 $('#scan').on('click',function(){
       codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
              if (result) {
                console.log(result)
                 
                 setTimeout(
                    function () {
                    $("body").css("-webkit-animation", "argh-my-eyes 300ms 1");
                    }, 600);
                $("body").css("-webkit-animation", "");
                sendData(result.text)
                codeReader.reset()
              }
              if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error(err)
                $('#postResult').html(err);  
              }
       })
 })
  $('#reset').on('click',function(){
        codeReader.reset()
        $('#postResult').html(''); 
        console.log('Reset.')
  })
   $('#close').on('click',function(){
        codeReader.reset()
        $('#postResult').html(''); 
        console.log('Close.')
        window.close()
  })
    $('#man').on('click',function(){
        
        if(display==0){
            codeReader.reset()
            $('#postResult').html(''); 
            console.log('Manual Entry.')
            $('#save').show()
            $('#reset').show()
            $('#usrId').show()
            display=1
        }else{
            codeReader.reset()
            $('#postResult').html(''); 
            console.log('Close Manual Entry.')
            $('#save').hide()
            $('#usrId').hide()
            display=0
        }
        
  })
    $('#save').on('click',function(){
        var usrId = $('#usrId').val()
        console.log(usrId);
        /* setTimeout(
            function () {
                $("body").css("-webkit-animation", "argh-my-eyes 300ms 1");
            }, 600);
            $("body").css("-webkit-animation", "");*/
        sendData(usrId)
        $('#usrId').val('')
    })
})