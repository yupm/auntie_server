$(document).ready(function(){$('[data-toggle="offcanvas"]').on("click",function(){$(".offcanvas-collapse").toggleClass("open")});for(var a=document.querySelectorAll(".delete"),b=0;b<a.length;b++)a[b].addEventListener("click",function(a){a.preventDefault();confirm(this.getAttribute("data-confirm"))&&(window.location.href=this.getAttribute("href"))});$("#eventFilter").submit(function(){$(this).find(":input").filter(function(){return!this.value}).attr("disabled","disabled");return!0});$("#eventFilter").find(":input").prop("disabled",
!1);$("#dealFilter").submit(function(){$(this).find(":input").filter(function(){return!this.value}).attr("disabled","disabled");return!0});$("#dealFilter").find(":input").prop("disabled",!1);if(a=document.getElementById("searchFilter")){b=window.location.search.substring(1);b=parse_query_string(b);var d=document.getElementById("qloc");b.loc&&(d.value=b.loc);for(var c in b)a.elements.namedItem(c)||(d=document.createElement("input"),d.setAttribute("type","hidden"),d.setAttribute("name",c),d.setAttribute("value",
b[c]),a.appendChild(d))}$('[data-role="dynamic-fields"]').on("click",'[data-role="add"]',function(a){a.preventDefault();a=$(this).closest('[data-role="dynamic-fields"]');new_field_group=a.children().filter(".p-specs:first-child").clone();new_field_group.find("input").each(function(){$(this).val("")});a.append(new_field_group)});$('[data-role="dynamic-fields"]').on("click",'[data-role="remove"]',function(a){a.preventDefault();$(this).closest(".p-specs").remove()})});var editor,edesc=document.querySelector("#edesc");
edesc&&ClassicEditor.create(document.querySelector("#edesc"),{toolbar:"bold italic link bulletedList numberedList blockQuote".split(" ")}).then(function(a){editor=a})["catch"](function(a){console.error(a)});var pdesc=document.querySelector("#pdesc");
if(pdesc){ClassicEditor.create(pdesc,{toolbar:"bold italic link bulletedList numberedList blockQuote".split(" ")}).then(function(a){editor=a})["catch"](function(a){console.error(a)});var cropper0,crop0,curPos,inputInfo=[];$(".prod-thumb:file").on("change",function(){curPos=this.id.match(/\d+/)[0];var a=inputInfo.map(function(a){return a.id}).indexOf(curPos);0>a?inputInfo.push({id:curPos,name:"c-"+this.files[0].name,type:this.files[0].type}):(inputInfo[a].name="c-"+this.files[0].name,inputInfo[a].type=
this.files[0].type);a=new FileReader;a.readAsDataURL(this.files[0]);null!=cropper0&&cropper0.destroy();a.onload=function(a){$("#myModal").modal("show");document.getElementById("cropperImage").src=a.target.result};this.value=null});$("#myModal").on("shown.bs.modal",function(){var a=document.getElementById("cropperImage");cropper0=new Cropper(a,{aspectRatio:1,responsive:!0})});var showImg=document.getElementById("preview-0"),formData1=$("form[id*='formData1']")[0];$("#cropbtn").click(function(){var a=
inputInfo.map(function(a){return a.id}).indexOf(curPos),b=document.getElementById("preview-"+curPos);cropper0.getCroppedCanvas({minWidth:256,minHeight:256,maxWidth:4096,maxHeight:4096,fillColor:"#fff",imageSmoothingEnabled:!0,imageSmoothingQuality:"high"}).toBlob(function(d){var c=URL.createObjectURL(d);b.style.display="block";b.src=c;inputInfo[a].blob=d},inputInfo[a].type)})}$(".timg").on("click",function(){document.getElementById("mainImg").src=$(this)[0].src});
function parse_query_string(a){a=a.split("&");for(var b={},d=0;d<a.length;d++){var c=a[d].split("="),e=decodeURIComponent(c[0]);c=decodeURIComponent(c[1]);"undefined"===typeof b[e]?b[e]=decodeURIComponent(c):"string"===typeof b[e]?(c=[b[e],decodeURIComponent(c)],b[e]=c):b[e].push(decodeURIComponent(c))}return b}
function PostForm(){var a=new FormData($("form[id*='formData1']")[0]),b=editor.getData();a.set("pdesc",b);for(b=0;b<inputInfo.length;b++)a.append("cdata",inputInfo[b].blob,inputInfo[b].name);$.ajax({url:"/post",data:a,cache:!1,contentType:!1,processData:!1,type:"POST",success:function(a,b,e){window.location.href=a.redirect}})};