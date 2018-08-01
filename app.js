// Budget Controller
var budgetController = (function(){

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      expense: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1

  };

  var calcTotal = function(type){
    var sum = 0;
      data.allItems[type].forEach(function(cur){
        sum += cur.value;
      });
      data.totals[type] = sum;
  };

  return {
    addItem: function(type, des, val){
      var newItem, ID;

      // new ID
      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }else {
        ID = 0;
      }

      // create new item
      if(type === 'exp'){
        newItem = new Expense(ID, des, val);
      }else {
        newItem = new Income(ID, des, val);
      }

      // push new item into data structure
      data.allItems[type].push(newItem);
      // return the new item
      return newItem;
    },

    // calculate budget
    calculateBudget: function(){
      // calculate total income and expenses
      calcTotal('income');
      calcTotal('expense');
      // calculate budget
      data.budget =  data.totals.income - data.totals.expense;
      // calcuate percentage
      if(data.totals.income > 0){
        data.percentage = Math.round(data.totals.expense / data.totals.income * 100);
      }
    },

    getBudget: function(){
      return {
        totalIncome: data.totals.income,
        totalExpense: data.totals.expense,
        budget: data.budget,
        percentage: data.percentage
      }
    },


    testing: function(){
      console.log(data);
    }
  }

})();

// UI Controller
var UIController = (function(){
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list'

  };
  return {
    getInput: function(){
      return {
        type: document.querySelector(DOMstrings.inputType).value, // income or expense
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
      // create HTML strings with placeholder text
      if(type === 'income'){
          element = DOMstrings.incomeContainer;
          html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }else {
          element = DOMstrings.expensesContainer;
          html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    clearFields: function(){
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(cur, i, array){
        cur.value = "";
      });

      fieldsArr[0].focus();
    },
    getDOMstrings: function(){
      return DOMstrings;
    }
  };
})();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl){

  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event){
      if(event.keyCode === 13 /* || event.which === 13  for older browsers*/){
        ctrlAddItem();
      }
    });
  };

  var updateBudget = function(){
    //  Calculate the budget
    budgetCtrl.calculateBudget();
    // return the budget
    var budget = budgetCtrl.getBudget();
    //  display the budget on UI
    console.log(budget);
  };

  var ctrlAddItem = function(){
    var input, newItem;
    // todo list
    // 1. get input data
    input = UICtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
      // 2. add the item to the budget Controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. add the item to UI
      UICtrl.addListItem(newItem, input.type);
      // 4. clear fields
      UICtrl.clearFields();
      // 5. calculate and update budget
      updateBudget();
    }
  };

  return {
    init: function(){
      console.log('started');
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();
