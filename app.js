// Budget Controller
var budgetController = (function(){

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round(this.value / totalIncome * 100);
    }else{
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
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
      if(type === 'expense'){
        newItem = new Expense(ID, des, val);
      }else {
        newItem = new Income(ID, des, val);
      }

      // push new item into data structure
      data.allItems[type].push(newItem);
      // return the new item
      return newItem;
    },

    deleteItem: function(type, id){
      // var index;
      // for(var i = 0; i < data.allItems[type].length; i++){
      //   if(data.allItems[type][i].id === id){
      //     index = i;
      //     break;
      //   }
      // }

      //map
      var ids, index;
      ids = data.allItems[type].map(function(cur){
        return cur.id;
      });
      index = ids.indexOf(id);

      if(index !== -1){
        data.allItems[type].splice(index, 1);
      }
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

    calculatePercentages: function(){
      data.allItems.expense.forEach(function(cur){
        cur.calcPercentage(data.totals.income);
      });
    },

    getPercentage: function(){
      var allPerc = data.allItems.expense.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },

  

    // testing
    // testing: function(){
    //   console.log(data);
    // }
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
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentage: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type){
    // rule 1. + or - before number
    // rule 2. exactly 2 decimal points 
    // rule 3. comma separating the thousands 2345.6789 -> + 2,345.68

    var numSplit, int, dec;
    
    num = Math.abs(num);
    num = num.toFixed(2); // num is a string now

    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if(int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    
    return (type === 'income'? '+':'-') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback){
    for(var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
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
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    displayBudget: function(obj){

      var type = obj.budget > 0 ? 'income' : 'expense';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'income');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpense, 'expense');
      if(obj.percentage > 0)
      {
        document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
      }else{
        document.querySelector(DOMstrings.percentage).textContent = '-';
      }
    },

    displayPercentages: function(percentages){

      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      nodeListForEach(fields, function(current, index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }else{
          current.textContent = '-';
        }
      });
    },

    displayMonth: function(){
      var months, now, year, month;
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

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

    changedType: function(){
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' + 
        DOMstrings.inputValue);

      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

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

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function(){
    //  Calculate the budget
    budgetCtrl.calculateBudget();
    // return the budget
    var budget = budgetCtrl.getBudget();
    //  display the budget on UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    // calculate percentages
    budgetCtrl.calculatePercentages();
    // read percentages from the budget controller
    var percentages = budgetCtrl.getPercentage();
    // update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function(){

    var input, newItem;
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
      // 6. calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){
      // income-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structure
        budgetCtrl.deleteItem(type, ID);
      // 2. delete the item from the UI
        UICtrl.deleteListItem(itemID);
      // 3. update and show the new budget
        updateBudget();
      // 4. calculate and update percentages
        updatePercentages();
    }
  };

  return {
    init: function(){
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();
