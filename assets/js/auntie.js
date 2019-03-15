$(document).ready(function () {
    $('[data-toggle="offcanvas"]').on('click', function () {
        $('.offcanvas-collapse').toggleClass('open');
    });

    /* Dash */
    var deleteLinks = document.querySelectorAll('.delete');
    for (var i = 0; i < deleteLinks.length; i++) {
        deleteLinks[i].addEventListener('click', function(event) {
            event.preventDefault();
            var choice = confirm(this.getAttribute('data-confirm'));
            if (choice) {
                window.location.href = this.getAttribute('href');
            }
        });
    }


    //Event
    $("#eventFilter").submit(function() {
        $(this).find(":input").filter(function(){ return !this.value; }).attr("disabled", "disabled");
        return true; // ensure form still submits
    });
    $( "#eventFilter" ).find( ":input" ).prop( "disabled", false );

    //Deals
    $("#dealFilter").submit(function() {
        $(this).find(":input").filter(function(){ return !this.value; }).attr("disabled", "disabled");
        return true; // ensure form still submits
    });
    $( "#dealFilter" ).find( ":input" ).prop( "disabled", false );

    
    //Search
    var formFilter = document.getElementById("searchFilter");
    if(formFilter){
        var query = window.location.search.substring(1);
        var qs = parse_query_string(query);
        var formLocDropdown = document.getElementById("qloc");

        if(qs['loc']){
            formLocDropdown.value = qs['loc'];
        }
        for (var key in qs) {
            if (! formFilter.elements.namedItem(key)) {
                var preInput = document.createElement("input");
                preInput.setAttribute("type", "hidden");
                preInput.setAttribute("name", key);
                preInput.setAttribute("value", qs[key]);
                //append to form element that you want .
                formFilter.appendChild(preInput);
            }
        }
    }

    //Post
    $('[data-role="dynamic-fields"]').on('click', '[data-role="add"]', function (e) {
        e.preventDefault();
        var container = $(this).closest('[data-role="dynamic-fields"]');
        new_field_group = container.children().filter('.p-specs:first-child').clone();
        new_field_group.find('input').each(function(){
            $(this).val('');
        });
        container.append(new_field_group);
    });

    $('[data-role="dynamic-fields"]').on('click', '[data-role="remove"]', function (e) {
        e.preventDefault();
        $(this).closest('.p-specs').remove();
    });


});


//promotion
let editor;
var edesc = document.querySelector( '#edesc' );
if(edesc){
    ClassicEditor
    .create( document.querySelector( '#edesc' ), {
        toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
    })
    .then( initEditor => {
        editor = initEditor;
    } )
    .catch( error => {
            console.error( error );
    } );
}


//post
var pdesc =document.querySelector( '#pdesc' );
if(pdesc){
    ClassicEditor
    .create( pdesc, {
        toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
    })
    .then( initEditor => {
        editor = initEditor;
    } )
    .catch( error => {
            console.error( error );
    } );
    var cropper0;
    var crop0;
    var curPos;
    var inputInfo = [];

    
    $('.prod-thumb:file').on('change', function() {
        curPos = this.id.match(/\d+/)[0];

        var index = inputInfo.map(function(e) { return e.id; }).indexOf(curPos);
        if(index < 0){
            inputInfo.push({id: curPos, name: 'c-' + this.files[0].name, type:this.files[0].type });
        }else{
            inputInfo[index].name = 'c-' + this.files[0].name;
            inputInfo[index].type = this.files[0].type;
        }

        var oFReader = new FileReader();
        oFReader.readAsDataURL(this.files[0]);

        if(cropper0!= null){
            cropper0.destroy();
        }

        oFReader.onload = function (oFREvent) {    
            $('#myModal').modal('show');
            var image = document.getElementById('cropperImage');
            image.src = oFREvent.target.result;
        };   
        this.value = null;
    });
  
    $('#myModal').on('shown.bs.modal', function () {
        var image = document.getElementById('cropperImage');

        cropper0 = new Cropper(image, {
                aspectRatio: 1 / 1,
                responsive: true
        });
    });

    var showImg = document.getElementById('preview-0');  
    var formData1  = $("form[id*='formData1']")[0];

    $("#cropbtn").click(function() {
        var index = inputInfo.map(function(e) { return e.id; }).indexOf(curPos);
        var showImg = document.getElementById('preview-' + curPos);  
        cropper0.getCroppedCanvas({
            minWidth: 256,
            minHeight: 256,
            maxWidth: 4096,
            maxHeight: 4096,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        }).toBlob((blob) => {              
            const imagetemp = URL.createObjectURL(blob);
            showImg.style.display = "block";
            showImg.src = imagetemp;  
            inputInfo[index].blob = blob;
        }, inputInfo[index].type);
    });  
    
}

//details
$('.timg').on('click', function() {
    document.getElementById("mainImg").src = $(this)[0].src;
});  

//Post
function parse_query_string(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        // If first entry with this name
        if (typeof query_string[key] === "undefined") {
        query_string[key] = decodeURIComponent(value);
        // If second entry with this name
        } else if (typeof query_string[key] === "string") {
        var arr = [query_string[key], decodeURIComponent(value)];
        query_string[key] = arr;
        // If third or later entry with this name
        } else {
        query_string[key].push(decodeURIComponent(value));
        }
    }
    return query_string;
}

    
function PostForm()
{
    var data = new FormData($("form[id*='formData1']")[0]);
    var descData = editor.getData();
    data.set('pdesc', descData );

    for(var i = 0; i< inputInfo.length; i++){
        data.append("cdata", inputInfo[i].blob, inputInfo[i].name);
    }

    $.ajax({
        url: '/post',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(data, textStatus, jqXHR){
            window.location.href = data.redirect;
        }
    });
};
