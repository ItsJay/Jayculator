(function () {
  var app = angular.module("jayculatorApp");

  function JayculatorController($http) {
    /*   var statusEnum = ['READY', 'OP1', 'OPR', 'OP2', 'RESULT'];
        var operators = ['/','x','+','-'];*/
    var jayculatorUri = "https://localhost:44396/api/Jayculator";
    var maxLength = 14; //12 digits
    var maxResultLength = 19;

    var vm = this;
    vm.statusIndex = 0;
    vm.buttonSets = [
      ["D", "CE", "C", "/"],
      [7, 8, 9, "x"],
      [4, 5, 6, "-"],
      [1, 2, 3, "+"],
      ["+/-", 0, ".", "="],
    ];
    vm.display = "";
    vm.smartDisplay = "";
    vm.operation = "";
    vm.webApiError = "";
    vm.disableButtons = false;

    vm.init = init;
    vm.jayculate = calculate;

    function init() {
      newOp();
    }

    function calculate(btn) {
      if (isNaN(btn)) {
        switch (btn) {
          case "=":
            opComplete();
            break;
          case "+":
          case "-":
          case "x":
          case "/":
            setOperator(btn);
            break;
          case "CE":
            clearEntry();
            break;
          case "C":
            clear();
            break;
          case "+/-":
            toggleSign();
            break;
          case "D":
            backspace();
            break;
          case ".":
            setDecimalPoint();
            break;
          default:
          //opInProgress(btn);
        }
      } else {
        setOperands(btn);
      }
    }

    function opComplete() {
      vm.webApiError = "";
      if (vm.operation.operator !== "") {
        vm.disableButtons = true;
        if (
          vm.operation.operand1 !== "" &&
          vm.operation.operand2 === "" &&
          vm.operation.result === 0
        ) {
          vm.operation.operand2 = vm.operation.operand1;
        } else if (
          vm.operation.operand1 !== "" &&
          vm.operation.operand2 !== "" &&
          vm.operation.result > 0
        ) {
          vm.operation.operand1 = vm.operation.result;
          vm.operation.result = 0;
        }

        if (vm.operation.operand2.endsWith(".")) {
          vm.operation.operand2 = vm.operation.operand2.replace(".", "");
        }
        //if(vm.statusIndex == 3) {
        vm.statusIndex = 4; //RESULT
        $http
          .post(jayculatorUri, vm.operation)
          .then(
            function (response) {
              vm.operation.result = response.data.result.toString();
              refreshDisplay();
            },
            function (errResponse) {
              if (errResponse.status === -1) {
                vm.webApiError =
                  "Something went wrong. Pls check whether WebAPI is still running.";
              } else {
                vm.webApiError = "Something went wrong. " + errResponse.data;
              }
              refreshDisplay();
            }
          )
          .then(function () {
            vm.disableButtons = false;
          });
        //}
      }
    }

    function setOperands(btn) {
      if (vm.statusIndex === 4) {
        vm.statusIndex = 0;
        newOp();
      }

      if (vm.statusIndex === 0 || vm.statusIndex === 1) {
        setOperand1(btn);
      } else {
        setOperand2(btn);
      }
    }

    function newOp() {
      //vm.statusIndex = 0; //READY
      vm.webApiError = "";
      vm.operation = { operand1: "", operator: "", operand2: "", result: 0 };
    }

    function setOperand1(btn) {
      vm.statusIndex = 1; //OP1
      if (vm.operation.operand1 === "0") {
        if (btn !== "0") {
          vm.operation.operand1 = btn.toString();
        }
      } else {
        if(vm.operation.operand1.length<=maxLength-1)
            vm.operation.operand1 += btn;
      }
      refreshDisplay();
    }

    function setOperand2(btn) {
      vm.statusIndex = 3;
      if (vm.operation.operand2 === "0") {
        if (btn !== "0") {
          vm.operation.operand2 = btn.toString();
        }
      } else {
        if(vm.operation.operand2.length<=maxLength-1)
          vm.operation.operand2 += btn;
      }
      refreshDisplay();
    }

    function setOperator(btn) {
      if (vm.statusIndex === 4) {
        vm.operation.operand1 = vm.operation.result.toString();
        vm.operation.operand2 = "";
        vm.operation.result = 0;
      }
      vm.statusIndex = 2;
      vm.operation.operator = btn;
      //cleardecimalplacesIf at the right end
      if (vm.operation.operand1.endsWith(".")) {
        vm.operation.operand1 = vm.operation.operand1.replace(".", "");
      }
      refreshDisplay();
    }

    function setDecimalPoint() {
      switch (vm.statusIndex) {
        case 1:
          if (!vm.operation.operand1.includes(".")) {
            if (vm.operation.operand1 !== "") {
              vm.operation.operand1 += ".";
            } else {
              vm.operation.operand1 += "0.";
            }
            refreshDisplay();
          }
          break;
        case 2:
          vm.statusIndex = 3;
          setDecimalPoint();
        case 3:
          if (!vm.operation.operand2.includes(".")) {
            if (vm.operation.operand2 !== "") {
              vm.operation.operand2 += ".";
            } else {
              vm.operation.operand2 += "0.";
            }
            refreshDisplay();
          }
          break;
        case 4:
          clear();
          vm.statusIndex = 1;
          setDecimalPoint();
        default:
        //do nothing
      }
    }

    function clearEntry() {
      switch (vm.statusIndex) {
        case 1:
          vm.operation.operand1 = "";
          refreshDisplay();
          break;
        case 2:
        case 3:
          //this is a spl case
          vm.operation.operand2 = "";
          vm.display = "0";
          break;
        case 4:
          clear();
        default:
        //do nothing
      }
    }

    function backspace() {
      switch (vm.statusIndex) {
        case 1:
          if (vm.operation.operand1 !== "") {
            vm.operation.operand1 = vm.operation.operand1.substr(
              0,
              vm.operation.operand1.length - 1
            );
          }
          break;
        case 3:
          //this is a spl case
          if (vm.operation.operand2 !== "") {
            vm.operation.operand2 = vm.operation.operand2.substr(
              0,
              vm.operation.operand2.length - 1
            );
          }
          break;
        case 4:
          clear();
        default:
        //do nothing
      }
      refreshDisplay();
    }

    function clear() {
      vm.statusIndex = 0;
      newOp();
      refreshDisplay();
    }

    function toggleSign() {
      switch (vm.statusIndex) {
        case 1:
          if (vm.operation.operand1.startsWith("-")) {
            vm.operation.operand1 = vm.operation.operand1.replace("-", "");
          } else {
            vm.operation.operand1 = "-" + vm.operation.operand1;
          }
          break;
        case 3:
          if (vm.operation.operand2.startsWith("-")) {
            vm.operation.operand2 = vm.operation.operand2.replace("-", "");
          } else {
            vm.operation.operand2 = "-" + vm.operation.operand2;
          }
          break;
      }
      refreshDisplay();
    }

    function formatDisplay(x) {
      if(x.length > maxResultLength)
        return Number(x).toExponential(maxLength);
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

    function refreshDisplay() {
        //console.log(vm.operation);
        switch (vm.statusIndex) {
          case 0:
            vm.smartDisplay = "";
            vm.display = "";
            break;
          case 1:
            vm.smartDisplay = "";
            vm.display = formatDisplay(vm.operation.operand1);
            break;
          case 2:
            vm.smartDisplay =
              vm.operation.operand1 + " " + vm.operation.operator;
            vm.display = formatDisplay(vm.operation.operand1);
            break;
          case 3:
            vm.smartDisplay =
              vm.operation.operand1 + " " + vm.operation.operator;
            vm.display = formatDisplay(vm.operation.operand2);
            break;
          case 4:
            vm.smartDisplay =
              vm.operation.operand1 +
              " " +
              vm.operation.operator +
              " " +
              vm.operation.operand2 +
              " = ";
            vm.display = formatDisplay(vm.operation.result);
            break;
        }
    }
  }

  app.controller("jayculatorController", JayculatorController);
})();
