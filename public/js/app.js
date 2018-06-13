var url = "http://bts-bts.193b.starter-ca-central-1.openshiftapps.com/read/" ;

$.ajax({
    type: "GET",
    url: url,
    success: OnSuccessCall,
    error: OnErrorCall
});

function OnSuccessCall(response) {
    var AllEvents = response;

    //convert data to CSV
    function ConverToCSV(){
      const items = response
      const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
      const header = Object.keys(items[0])
      let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join('^'))
      csv.unshift(header.join('^'))
      csv = csv.join('\r\n')
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'Export.csv';
      hiddenElement.click();
    }

    $('#ExportToCSV').click(function(){
      ConverToCSV();
    });

    $("#jsGrid").jsGrid({
        width: "100%",
        height: "800px",

        filtering: true,
        inserting: false,
        editing: false,
        sorting: true,
        paging: true,
        autoload: true,

        fields: [
            {
                //checkboxes
                headerTemplate: function() {
                    return $("<button>").attr("type", "button").text("Delete")
                            .on("click", function () {
                                deleteSelectedItems();
                            });
                },
                //delete button
                itemTemplate: function(_, item) {
                    return $("<input>").attr("type", "checkbox")
                            .prop("checked", $.inArray(item, selectedItems) > -1)
                            .on("change", function () {
                                $(this).is(":checked") ? selectItem(item) : unselectItem(item);
                            });
                },
                align: "center",
                width: 50
            },
            //{ name: "_id", type: "text" },
            { name: "DeviceName", type: "text" },
            { name: "MaxRatioError", type: "number" },
            { name: "EventDate", type: "text" },
            { name: "Data", type: "text" },
            { name: "VectorGroup", type: "text" },
            { name: "SoftwareVersion", type: "number" },
            { type: "control",  width: 5, editButton: false,  deleteButton: false, clearFilterButton: true }
        ],

        controller: {
            data:AllEvents,
            loadData: function (filter) {
                return $.grep(this.data, function (item) {
                      //filter for each column
                      return ((!filter.MaxRatioError || item.MaxRatioError.indexOf(filter.MaxRatioError) >= 0)
                      && (!filter.DeviceName || item.DeviceName.indexOf(filter.DeviceName) >= 0)
                      //&& (!filter._id || item._id.indexOf(filter._id) >= 0)
                      && (!filter.EventDate || item.EventDate.indexOf(filter.EventDate) >= 0)
                      && (!filter.VectorGroup || item.VectorGroup.indexOf(filter.VectorGroup) >= 0)
                      && (!filter.SoftwareVersion || item.SoftwareVersion.indexOf(filter.SoftwareVersion) >= 0)
                      && (!filter.Data || item.Data.indexOf(filter.Data) >= 0)
                    );
                });
            }
        }
    });
}

function OnErrorCall(response) {
      console.log(response);
  }

//checkboxes
var selectedItems = [];

var selectItem = function(item) {
    selectedItems.push(item._id);
};

var unselectItem = function(item) {
    selectedItems = $.grep(selectedItems, function(i) {
        return i !== item;
    });
};

//delete
var deleteSelectedItems = function() {
        if(!selectedItems.length || !confirm("Are you sure?"))
            return;

        deleteClientsFromDb(selectedItems, function(){
          var $grid = $("#jsGrid");
          $grid.jsGrid("option", "pageIndex", 1);
          $grid.jsGrid("loadData");

          selectedItems = [];

          location.reload();
        });
    };

var deleteClientsFromDb = function(deletingClients, OnSuccessCall){

//ajax does not accept not formatted variable deletingClients
  function CreateDataForAjax(OriginalData){
    if (OriginalData.length === 1) {
      var NewData = ('_id=' + OriginalData);
    }
    else {
      var NewData = '';
      for (var i = 0; i < OriginalData.length; i++) {
        if (i === 0) {
          NewData += '_id=' + OriginalData[i]
        }
        else {
          //NewData.push('&_id=' + OriginalData[i])
          NewData += '&_id=' + OriginalData[i]
        }
      }
    }
    return NewData;
  }
  //CreateDataForAjax(deletingClients);
  var url = "http://bts-bts.193b.starter-ca-central-1.openshiftapps.com/delete/" ;
  $.ajax({
      type: "DELETE",
      contentType:'application/x-www-form-urlencoded',
      url: url, //+ '?_id=' + deletingClients,
      //data: '_id=' + deletingClients,
      data: CreateDataForAjax(deletingClients),
      success: OnSuccessCall,
      error: OnErrorCall
  });

  function OnErrorCall(response) {
     console.log(response);
  }
}
