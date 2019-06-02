/*********************************************************************************
* WEB422 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy.
* No part of this assignment has been copied manually or electronically from any
other source
* (including web sites) or distributed to other students.
*
* Name: John Angelo Cambi Student ID: 110671153 Date: June 1, 2019
*
*
********************************************************************************/

// Import jQuery, which will also expose $ on the global `window` Object.
import $ from './jquery-es';
// After jQuery is loaded, we can load the Bootstrap JS, which depends on jQuery.
import 'bootstrap';

// Place your imports for Moment.js and Lodash here...
import moment from 'moment';
import _ from 'lodash';

// The rest of your code can go here.  You're also welcome to split
// your code up into multiple files using ES modules and import/export.

let employeesModel = [];

function initializeEmployeesModel() {
  $.ajax({
    url: 'https://shielded-coast-83209.herokuapp.com/employees',
    type: 'GET',
    contentType: 'application/json'
  })
    .done(data => {
      for (let i = 0; i < data.length; i++) {
        employeesModel[i] = data[i];
      }
      refreshEmployeeRows(employeesModel);
    })
    .fail(err => {
      showGenericModal('Error', err.statusText);
    });
}

function showGenericModal(title, message) {
  $('.modal-title').empty();
  $('.modal-body').empty();
  $('.modal-title').append(title);
  $('.modal-body').append(`<p> ${message} </p>`);
  $('#genericModal').modal('show');
}

function refreshEmployeeRows(employees) {
  $('#employees-table').empty();
  let template1 = _.template(
    '<% _.forEach(employees, function(employee) { %>' +
      '<div class="row body-row" data-id="<%- employee._id %>" >' +
      '<div class="col-md-4 body-column text-center"><%- employee.FirstName %></div>' +
      '<div class="col-md-4 body-column text-center"><%- employee.LastName %></div>' +
      '<div class="col-md-4 body-column text-center"><%- employee.Position.PositionName %></div>' +
      '</div>' +
      '<% }); %>'
  );

  let templateResult = template1({ employees: employees });
  $('#employees-table').append(templateResult);
}

function getFilteredEmployeesModel(filterString) {
  let filterString1 = filterString.toUpperCase();
  let filteredEmployees = _.filter(employeesModel, function(employee) {
    let fname = employee.FirstName.toUpperCase();
    let lname = employee.LastName.toUpperCase();
    let positionName = employee.Position.PositionName.toUpperCase();
    return (
      fname.includes(filterString1) ||
      lname.includes(filterString1) ||
      positionName.includes(filterString1)
    );
  });
  return filteredEmployees;
}

function getEmployeeModelById(id) {
  for (let i = 0; i < employeesModel.length; i++) {
    if (id == employeesModel[i]._id) {
      let cloneDeep = _.cloneDeep(employeesModel[i]);
      return cloneDeep;
    }
  }
  return null;
}

$(() => {
  console.log('loaded');

  initializeEmployeesModel();

  $('#employee-search').keyup(function() {
    let string = $('#employee-search').val();
    let filtered = getFilteredEmployeesModel(string);
    console.log(filtered);
    refreshEmployeeRows(filtered);
  });

  $('div').on('click', '.body-row', function(element) {
    element.preventDefault();
    let id = $(this).attr('data-id');
    let copy = getEmployeeModelById(id);
    _.uniqBy(copy, 'id');

    let hireDate = copy.HireDate;
    let mDate = moment(hireDate);

    let template1 = _.template(
      '<strong>Address: </strong>' +
        '<%- copy.AddressStreet %>' +
        ', ' +
        '<%- copy.AddressState %>' +
        ', ' +
        '<%- copy.AddressCity %>' +
        ', ' +
        '<%- copy.AddressZip %>' +
        '<br>' +
        '<strong>Phone Number: </strong>' +
        '<%- copy.PhoneNum %>' +
        ' ext. ' +
        '<%- copy.Extension %>' +
        '<br>' +
        '<strong>Hire Date: </strong>' +
        '<%- mDate %>'
    );
    let templateResult = template1({ copy: copy, mDate: mDate.format('LL') });
    showGenericModal(copy.FirstName + ' ' + copy.LastName, templateResult);
  });
});
