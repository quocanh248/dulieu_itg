const clickableCells = document.querySelectorAll('.clickable');
var laplichvao = document.getElementById("laplichvao");
var laplichra = document.getElementById("laplichra");
var myModal = document.getElementById("myModalcv1");
var ngay = document.getElementById("ngay");
var tag = document.getElementById("tag");
var diemdanhvao = document.getElementById("diemdanhvao");
var diemdanhra = document.getElementById("diemdanhra");
var closecv1 = document.getElementsByClassName("closecv1")[0];
closecv1.addEventListener("click", function() {
    myModal.style.display = "none";   
});
// Lặp qua danh sách và thêm sự kiện click
clickableCells.forEach(cell => {
    cell.addEventListener('click', () => {
        myModal.style.display = "block";
        var ip1 = document.querySelectorAll("#myModalcv1 input");    
        ip1.forEach(function(input) {
            input.value = "";
        });
        const inputs = cell.querySelectorAll('input[type="text"]');
        console.log(inputs);
        ngay.value= inputs[0].value;
        tag.value = inputs[1].value;
        diemdanhvao.value = inputs[4].value;
        diemdanhra.value = inputs[5].value;
        laplichvao.value = inputs[2].value;
        laplichra.value = inputs[3].value;

    });
});