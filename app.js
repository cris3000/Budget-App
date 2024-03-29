


	// Budget Controller

var budgetController =  (function (){
	
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
		
	};
	
	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome)*100);
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
	
	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		data.totals[type] = sum;
	};
	
	var data = {
		allItems:{
			exp : [],
			inc : []
		},
		totals:{
			exp:0,
			inc:0
		},
		percentage:{
			budget:0,
			percentage: -1
		}
	};
	
	return {
		addItem: function(type, des, val){
			var newItem, ID;
			
			// create new id, then create new item based on inc or exp type
			
			if (data.allItems[type].length>0){
				ID = data.allItems[type][data.allItems[type].length-1].id+1;
			}else{
				ID=0;
			}
			
			if (type==='exp'){
				newItem = new Expense(ID, des, val);
			}else if (type ==='inc'){
				newItem = new Income(ID, des, val);
			}
			
			// then push it into our data structure,
			data.allItems[type].push(newItem);
			
			// return our new element
			return newItem;
		},
		
		
		deleteItem: function(type, id){
			
			var ids, index;
			// id = 3
			
			
			ids=data.allItems[type].map(function(current){
				return current.id;
			});
			
			index = ids.indexOf(id);
			
			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
			
		},	
		
		calculateBudget: function(){
			
			//calculate total income and expenses
			
			calculateTotal('exp');
			calculateTotal('inc');
			
			//calculate budget: income - expenses
			
			data.budget = data.totals.inc - data.totals.exp;
			
			//calculate the percentage of income that we spend
			
			if(data.totals.inc > 0 ){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) *100);
			}else{
				data.percentage = -1;
			}
			
		
			
		},
		
		calculatePercentages: function(){
			
			/*
			 *   Total expense based on total Income
			 */
			
			data.allItems.exp.forEach(function(curr){
				curr.calcPercentage(data.totals.inc);
			});
		},
		
		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},
		
		
		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},
		
		testing: function (){
			console.log(data);
		}
		
	};
	
})();



	// UI Controller
var UIController = (function(){
	
	
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn:'.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
		
	};
	
	var formatNumber = function(num, type){
			var numSplit;
			/*
			 * + or - before number, exactly 2 decimal points  comma separating the thousands 2310.4567 -> + 2,310.46
			 */
			
			num = Math.abs(num);
			num = num.toFixed(2);
			
			numSplit = num.split('.');
			
			int = numSplit[0];
			
			if(int.length > 3){
				int = int.substr(0,int.length -3) + ',' + int.substr(int.length-3,3); // Input 2310, output 2,310
			}
			
			dec = numSplit[1];
			
			return (type === 'exp' ?'-' : '+') + ' ' + int + '.'+dec;
	
	};
	
	return {
		getInput: function(){
			return{
				
			type:document.querySelector(DOMstrings.inputType).value, // Will be either inc for income, or ex for expense
			description: document.querySelector(DOMstrings.inputDescription).value,
			value: parseFloat (document.querySelector(DOMstrings.inputValue).value)
			};
		},
		
		addListItem: function(obj, type){
			var html, newHtml, element;
			// Create HTML string with placeholder text
			
			
			if(type==='inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type==='exp'){
				element = DOMstrings.expensesContainer;
			html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			// replace placeholder text with data received from object
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			
			// insert HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		
		
		deleteListItem: function(selectorID){
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
			
		},
		
		
		clearFields: function(){
			var fields, fieldsArr;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			
			fieldsArr = Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});
			
			fieldsArr[0].focus();
			
		},
		
		
		displayBudget: function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			
		
		
		if(obj.percentage >0){
			document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
		}else{
			document.querySelector(DOMstrings.percentageLabel).textContent = '---';
		}
	},	
		displayPercentages: function(percentages){
			
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
			
			var nodeListForEach = function(list, callback){
				for(var i = 0; i < list.length; i++){
					callback(list[i], i);
				}
			};
			
			nodeListForEach(fields, function(current, index){
				
				if(percentages[index] > 0){
				current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '---';
				}
				// Do Stuff
				
			});
			
		},
		
		displayMonth: function(){
			var now, year, month, months;
			now = new Date();
			
			months= ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month =  now.getMonth();
			year= now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month]+ ' ' +year;
			
		},
		
		getDOMstrings: function(){
			return DOMstrings;
		}
	};
	
	
})();

	//Global App Controller
var controller = (function(budgetCtrl, UICtrl){
	
	var setupEventListeners = function(){
		
		var DOM = UICtrl.getDOMstrings();	
			
		//clicking submit
		document.querySelector(DOM.inputBtn).addEventListener('click', controlAddItem);
		//for pressing Enter key
		document.addEventListener('keypress', function(event){
			
			if(event.keyCode === 13 || event.which === 13){
				controlAddItem();
				}
			});
		
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		
	};
	
	var updatePercentages = function(){
		
		
		// 1. Calculate percentages
		
		budgetCtrl.calculatePercentages();
		
		// 2. Read from budget controller
		var percentages = budgetCtrl.getPercentages();
		
		// 3. Update UI with the new percentages
		UICtrl.displayPercentages(percentages);
		
		};
		
	var updateBudget = function (){
		
		// 1. Calc budget
		budgetCtrl.calculateBudget();
		
		// 2. return budget
		var budget = budgetCtrl.getBudget();
		
		
		
		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
		
	};
	
	var controlAddItem = function(){
		
		
			var input, newItem;
			// 1. Get field input data
			input = UICtrl.getInput();			
		
			if (input.description !== "" && !isNaN(input.value) && input.value > 0){
				// 2. Add item to budget Controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			
			// 3. Add item to user interface
			UICtrl.addListItem(newItem, input.type);
			
			// 4 clear fields
			
			UICtrl.clearFields();
			
			// 4. Calculate budget n update Budget
			updateBudget();
			
			// 5. Display Budget on the UI
		
			updatePercentages();
			}
			
			
	};
	
	
	var ctrlDeleteItem = function (event){
		var itemID, type, ID, splitID;
		itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
		
		if(itemID){
			
			//inc -1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			// 1. Delete item from Data Structure
			
			budgetCtrl.deleteItem(type, ID);
			
			// 2. Delete Item from user interface
			UICtrl.deleteListItem(itemID);
			
			// 3. Update n show from new budget
			updateBudget();
			
		}
	};
	
	return {
		init: function(){
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController);

// calls init property, of which returns the event listeners as publicly accessible
controller.init();





