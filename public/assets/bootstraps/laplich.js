var ipbophan = document.getElementById("dsbophan");
ipbophan.addEventListener("input", timKiem);
function timKiem() {
    var filter = ipbophan.value.toUpperCase();
    var table = document.getElementById("bangdsnhansubody");
    var tr = table.getElementsByTagName("tr");

    for (var i = 0; i < tr.length; i++) {
        var td = tr[i].getElementsByTagName("td")[2];
        if (td) {
            var txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
//Khai báo modal
var myModalcv1 = document.getElementById("myModalcv1");
var closeButtoncv1 = document.getElementsByClassName("closecv1")[0];
var myModalcv2 = document.getElementById("myModalcv2");
var closeButtoncv2 = document.getElementsByClassName("closecv2")[0];
var myModalcv3 = document.getElementById("myModalcv3");
var closeButtoncv3 = document.getElementsByClassName("close")[0];
//tắt modal lập lịch
closeButtoncv1.addEventListener("click", function () {
    myModalcv1.style.display = "none";
    myModalcv2.style.display = "none";
});
closeButtoncv3.addEventListener("click", function () {
    myModalcv1.style.display = "none";
    myModalcv3.style.display = "none";
});
//tắt modal lập lịch các nhân
closeButtoncv2.addEventListener("click", function () {
    location.reload();
    myModalcv1.style.display = "none";
    myModalcv2.style.display = "none";
    sessionStorage.removeItem("selectedEvents");
    sessionStorage.removeItem("selectedEvents12");
});
//hiển thị modal lập lịch
$("#viewlaplich").click(function () {
    myModalcv1.style.display = "block";
});
// hiển thị modal nghỉ nhóm
$("#viewnghinhom").click(function () {
    myModalcv3.style.display = "block";
});
$(document).ready(function () {
    // Xử lý sự kiện khi click vào checkbox "Chọn tất cả"
    $("#select-all").on("click", function () {
        var checkboxes = $(".checkbox"); // Lấy tất cả các checkbox
        var selectedValues = []; // Mảng chứa các giá trị đã chọn

        // Kiểm tra trạng thái của checkbox "Chọn tất cả"
        if ($(this).is(":checked")) {
            // Chọn tất cả các checkbox hiển thị trên màn hình
            checkboxes.filter(":visible").prop("checked", true);

            // Lưu giá trị các checkbox vào mảng selectedValues
            checkboxes.filter(":visible").each(function () {
                selectedValues.push($(this).val());
            });
        } else {
            // Bỏ chọn tất cả các checkbox
            checkboxes.prop("checked", false);
        }

        // Lưu mảng selectedValues vào session
        sessionStorage.setItem(
            "selectedValues",
            JSON.stringify(selectedValues)
        );
    });

    // Xử lý sự kiện khi click vào các checkbox riêng lẻ
    $(".checkbox").on("click", function () {
        var selectedValues = []; // Mảng chứa các giá trị đã chọn

        // Lặp qua tất cả các checkbox và lưu giá trị đã chọn vào mảng selectedValues
        $(".checkbox:checked").each(function () {
            selectedValues.push($(this).val());
        });

        // Lưu mảng selectedValues vào session
        sessionStorage.setItem(
            "selectedValues",
            JSON.stringify(selectedValues)
        );
    });

    // Kiểm tra và khôi phục trạng thái checkbox từ session khi tải lại trang
    var selectedValues = JSON.parse(sessionStorage.getItem("selectedValues"));
    if (selectedValues) {
        // Lặp qua mảng selectedValues và chọn các checkbox tương ứng
        selectedValues.forEach(function (value) {
            $('.checkbox[value="' + value + '"]').prop("checked", true);
        });
    }
});
var capnhat = document.getElementById("capnhat");
var huy = document.getElementById("huy");
$(".search-mini-cv1").click(function () {
    myModalcv2.style.display = "block";
    var buttonValue = this.value;
    capnhat.value = buttonValue;
    huy.value = buttonValue;
    var calendar1 = $("#calendar1");
    $(function () {
        $.ajaxSetup({
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
        });
        $.ajax({
            processData: false,
            contentType: false,
            type: "GET",
            dataType: "JSON",
            url: "/chitietlaplich/" + buttonValue,
            success: function (res) {
                console.log(res);
                calendar1.fullCalendar("removeEventSources");
                var selectedDates = [];
                calendar1.fullCalendar({
                    locale: "vi",
                    dayClick: function (date, jsEvent, view) {
                        var isSelected = $(this).hasClass("selected");
                        if (!isSelected) {
                            // Ngày chưa được chọn trước đó
                            selectedDates.push(date.format());
                            $(this).addClass("selected");

                            // Tạo sự kiện ảo và thay đổi màu sắc của ô ngày
                            var eventId = "event-" + date.format(); // Tạo id sự kiện độc nhất
                            var event = {
                                id: eventId,
                                title: "",
                                start: date,
                                end: date,
                                rendering: "background",
                                color: "red",
                            };
                            calendar1.fullCalendar("renderEvent", event, true);

                            // Thêm ngày vào Session Storage
                            sessionStorage.setItem(
                                "selectedEvents12",
                                JSON.stringify(selectedDates)
                            );
                        } else {
                            // Ngày đã được chọn trước đó
                            var index = selectedDates.indexOf(date.format());
                            if (index > -1) {
                                selectedDates.splice(index, 1);
                            }
                            $(this).removeClass("selected");

                            // Loại bỏ sự kiện ảo của ngày đó
                            var eventId = "event-" + date.format();
                            var event = calendar1.fullCalendar(
                                "clientEvents",
                                eventId
                            );
                            if (event) {
                                calendar1.fullCalendar("removeEvents", eventId);
                            }

                            // Xóa ngày khỏi Session Storage
                            sessionStorage.setItem(
                                "selectedEvents12",
                                JSON.stringify(selectedDates)
                            );
                        }
                    },
                    eventClick: function (calEvent, jsEvent, view) {
                        var eventDate = calEvent.start.format("YYYY-MM-DD");
                        var cellElement = $(
                            'td[data-date="' + eventDate + '"]'
                        );
                        if (cellElement.hasClass("selected")) {
                            cellElement.css("background-color", "");
                            cellElement.removeClass("selected");

                            var selectedEvents =
                                JSON.parse(
                                    sessionStorage.getItem("selectedEvents")
                                ) || [];
                            selectedEvents = selectedEvents.filter(function (
                                event
                            ) {
                                return event !== eventDate;
                            });
                            sessionStorage.setItem(
                                "selectedEvents",
                                JSON.stringify(selectedEvents)
                            );
                        } else {
                            cellElement.css("background-color", "#feb1b1");
                            cellElement.addClass("selected");

                            var selectedEvents =
                                JSON.parse(
                                    sessionStorage.getItem("selectedEvents")
                                ) || [];
                            selectedEvents.push(eventDate);
                            sessionStorage.setItem(
                                "selectedEvents",
                                JSON.stringify(selectedEvents)
                            );
                        }

                        console.log("Clicked event:", calEvent);
                    },
                });
                calendar1.fullCalendar("addEventSource", res);
            },
        });
    });
});

var ca = document.getElementById("ca");
var giovao = document.getElementById("giovao");
var giora = document.getElementById("giora");
var thoigiannghi = document.getElementById("thoigiannghi");
ca.addEventListener("change", function () {
    $(function () {
        $.ajaxSetup({
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
        });
        $.ajax({
            processData: false,
            contentType: false,
            type: "GET",
            dataType: "JSON",
            url: "/laythongtinca/" + ca.value,
            success: function (res) {
                console.log(res);
                giora.value = res[0].giora;
                giovao.value = res[0].giovao;
                thoigiannghi.value = res[0].thoigiannghi;
            },
        });
    });
});
//cập nhật ca
var capnhatca = document.getElementById("capnhatca");
var capnhatgiovao = document.getElementById("capnhatgiovao");
var capnhatgiora = document.getElementById("capnhatgiora");
var capnhatthoigiannghi = document.getElementById("capnhatthoigiannghi");
capnhatca.addEventListener("change", function () {
    $(function () {
        $.ajaxSetup({
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
        });
        $.ajax({
            processData: false,
            contentType: false,
            type: "GET",
            dataType: "JSON",
            url: "/laythongtinca/" + capnhatca.value,
            success: function (res) {
                capnhatgiovao.value = res[0].giora;
                capnhatgiora.value = res[0].giovao;
                capnhatthoigiannghi.value = res[0].thoigiannghi;
            },
        });
    });
});
//Lập lịch
$("#laplich").click(function () {
    var selectedValues = JSON.parse(sessionStorage.getItem("selectedValues"));
    var selectedDate = JSON.parse(sessionStorage.getItem("selectedDate"));
    if (selectedValues == null || selectedDate == null || giovao.value == "") {
        alert("Chọn nhân sự, ngày lập lịch, ca đầy đủ");
    } else {
        $(document).ready(function () {
            $.ajax({
                url: "/laplich",
                method: "POST",
                data: {
                    selectedValues: selectedValues,
                    selectedDate: selectedDate,
                    giovao: giovao.value,
                    giora: giora.value,
                    thoigiannghi: thoigiannghi.value,
                    _token: "{{ csrf_token() }}",
                },
                success: function (response) {
                    if (response.success) {
                        alert("Lập lịch thành công");
                    } else {
                    }
                },
                error: function (xhr, status, error) {
                    console.log(xhr.responseText);
                },
            });
        });
        location.reload();
    }
});
//cập nhật lịch
$("#capnhat").click(function () {
    var buttonValue = this.value;
    var chuaco = JSON.parse(sessionStorage.getItem("selectedEvents12"));
    var daco = JSON.parse(sessionStorage.getItem("selectedEvents"));
    $(document).ready(function () {
        $.ajax({
            url: "/capnhatlich",
            method: "POST",
            data: {
                chuaco: chuaco,
                daco: daco,
                tag: buttonValue,
                giovao: capnhatgiovao.value,
                giora: capnhatgiora.value,
                thoigiannghi: capnhatthoigiannghi.value,
                _token: "{{ csrf_token() }}",
            },
            success: function (response) {
                if (response.success) {
                    alert("Cập nhật lịch thành công");
                } else {
                }
            },
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
            },
        });
    });
    location.reload();
});
$("#huy").click(function () {
    var buttonValue = this.value;
    var daco = JSON.parse(sessionStorage.getItem("selectedEvents"));
    $(document).ready(function () {
        $.ajax({
            url: "/huylich",
            method: "POST",
            data: {
                daco: daco,
                tag: buttonValue,
                _token: "{{ csrf_token() }}",
            },
            success: function (response) {
                if (response.success) {
                    alert("Hủy thành công");
                } else {
                }
            },
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
            },
        });
    });
    //location.reload();
});
var loaingaynghi = document.getElementById("loaingaynghi");
var lydo = document.getElementById("lydo");
$("#xacnhan").click(function () {
    var selectedValues = JSON.parse(sessionStorage.getItem("selectedValues"));
    var selectedDate = JSON.parse(sessionStorage.getItem("selectedDate"));
    if (selectedValues == null || selectedDate == null) {
        alert("Chọn nhân sự và ngày nghỉ phép");
    } else {
        $(document).ready(function () {
            $.ajax({
                url: "/xacnhannghiphepnhom",
                method: "POST",
                data: {
                    selectedValues: selectedValues,
                    selectedDate: selectedDate,
                    loaingaynghi: loaingaynghi.value,
                    lydo: lydo.value,
                    _token: "{{ csrf_token() }}",
                },
                success: function (response) {
                    if (response.success) {
                        alert("thành công");
                    }
                },
                error: function (xhr, status, error) {
                    console.log(xhr.responseText);
                },
            });
        });
        location.reload();
    }
});
var input = document.getElementById("manhanvienInput");
$(window).on("beforeunload", function () {
    // Xóa Session khi tải lại trang
    sessionStorage.removeItem("selectedValues");
    sessionStorage.removeItem("selectedDate");
    sessionStorage.removeItem("selectedEvents");
    sessionStorage.removeItem("selectedEvents12");
});
$(document).ready(function () {
    var calendar = $("#calendar");
    var selectedDates = []; // Mảng lưu trữ các ngày đã được chọn

    // Khởi tạo lịch trên phần tử #calendar
    calendar.fullCalendar({
        // Cấu hình FullCalendar

        // Sự kiện khi người dùng click vào ô ngày
        dayClick: function (date, jsEvent, view) {
            // In ra ngày được chọn
            console.log("Ngày được chọn:", date.format());

            var isSelected = $(this).hasClass("selected");
            if (!isSelected) {
                // Ngày chưa được chọn trước đó
                selectedDates.push(date.format());
                $(this).addClass("selected");
                // Thêm class 'selected' cho ô ngày được chọn

                // Tạo sự kiện ảo và thay đổi màu sắc của ô ngày
                var eventId = "event-" + date.format(); // Tạo id sự kiện độc nhất
                var event = {
                    id: eventId,
                    title: "",
                    start: date,
                    end: date,
                    rendering: "background",
                    color: "red",
                };
                calendar.fullCalendar("renderEvent", event, true);

                // Thêm ngày vào Session Storage
                sessionStorage.setItem(
                    "selectedDate",
                    JSON.stringify(selectedDates)
                );

                console.log("Ngày đã được thêm vào Session Storage.");
            } else {
                // Ngày đã được chọn trước đó
                var index = selectedDates.indexOf(date.format());
                if (index > -1) {
                    selectedDates.splice(index, 1);
                }
                $(this).removeClass("selected");
                // Xóa class 'selected' khỏi ô ngày

                // Loại bỏ sự kiện ảo của ngày đó
                var eventId = "event-" + date.format(); // Tạo id sự kiện tương ứng
                var event = calendar.fullCalendar("clientEvents", eventId);
                if (event) {
                    calendar.fullCalendar("removeEvents", eventId);
                }

                // Xóa ngày khỏi Session Storage
                sessionStorage.setItem(
                    "selectedDate",
                    JSON.stringify(selectedDates)
                );

                console.log("Ngày đã được xóa khỏi Session Storage.");
            }
        },
    });
    //lịch 2

    //xử lý table
    // Xử lý khi click vào input
    $('input[type="checkbox"]').on("change", function () {
        var isChecked = $(this).is(":checked");
        var value = $(this).val();

        if (isChecked) {
            // Thêm giá trị vào Session
            addToSession(value);
            // Tô màu hàng tương ứng
            highlightRow($(this).closest("tr"));
        } else {
            // Xóa giá trị khỏi Session
            removeFromSession(value);
            // Bỏ tô màu hàng tương ứng
            unhighlightRow($(this).closest("tr"));
        }
    });

    // Hàm thêm giá trị vào Session
    function addToSession(value) {
        var selectedValues =
            JSON.parse(sessionStorage.getItem("selectedValues")) || [];
        selectedValues.push(value);
        sessionStorage.setItem(
            "selectedValues",
            JSON.stringify(selectedValues)
        );
    }

    // Hàm xóa giá trị khỏi Session
    function removeFromSession(value) {
        var selectedValues =
            JSON.parse(sessionStorage.getItem("selectedValues")) || [];
        var index = selectedValues.indexOf(value);
        if (index > -1) {
            selectedValues.splice(index, 1);
        }
        sessionStorage.setItem(
            "selectedValues",
            JSON.stringify(selectedValues)
        );
    }

    // Hàm tô màu hàng
    function highlightRow(row) {
        row.addClass("selected-row");
    }

    // Hàm bỏ tô màu hàng
    function unhighlightRow(row) {
        row.removeClass("selected-row");
    }
    // Khôi phục trạng thái đã lưu trong Session khi tải lại trang
    var selectedValues =
        JSON.parse(sessionStorage.getItem("selectedValues")) || [];
    selectedValues.forEach(function (value) {
        var input = $('input[value="' + value + '"]');
        input.prop("checked", true);
        highlightRow(input.closest("tr"));
    });
});
