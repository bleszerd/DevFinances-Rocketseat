const Modal = {
    open() {
        document.querySelector('#modal')
            .classList
            .add('active')
    },

    close() {
        document.querySelector('#modal')
            .classList
            .remove('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(sessionStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        sessionStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transactions = {
    all: Storage.get(),
    add(transaction){
        Transactions.all.push(transaction)
        App.reload()
    },
    remove(index){
        Transactions.all.splice(index, 1)
        App.reload()
    },
    incomes(){
        let income = 0
        Transactions.all.forEach(transaction => {
            if(transaction.amount > 0 ){
                income += transaction.amount
            }
        })

        return income
    },
    expenses(){
        let expense = 0
        Transactions.all.forEach(transaction => {
            if(transaction.amount < 0 ){
                expense += transaction.amount
            }
        })

        return expense
    },
    total(){
        return Transactions.incomes() + Transactions.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    addTransaction(transaction, index){
        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expanse"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td>${transaction.description}</td>
                <td class="${CSSclass}">${amount}</td>
            <td>${transaction.date}</td>
            <td>
                <img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="delete">
            </td>
        `

        return html
    },
    updateBalance(){
        document
            .querySelector("#incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.incomes())

        document
            .querySelector("#expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.expenses())

        document
            .querySelector("#totalDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.total())
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Form = {
    description: document.querySelector("#description"),
    amount: document.querySelector("#amount"),
    date: document.querySelector("#date"),
    getFormValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    validate(){
        const {description, amount, date} = Form.getFormValues()

        if(description && amount && date)
            return

        throw new Error("Por favor informe todos os campos")
    },
    fit(){
        let {description, amount, date} = Form.getFormValues()

        FitForm = {
            description(){
                return description
            },
            amount(){
                return amount * 100
            },
            date(){
                date = date.split("-")
                return `${date[2]}/${date[1]}/${date[0]}`
            }
        }

        return {
            description: FitForm.description(),
            amount: FitForm.amount(),
            date: FitForm.date(),
        }
    },
    clear(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event){
        try{
            event.preventDefault()
            Form.validate()
            const transaction = Form.fit()
            Transactions.add(transaction)
            Modal.close()
            Form.clear()
            
        } catch(error){
            alert(error.message)
        }
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const App = {
    init(){
        Transactions.all.forEach(transaction => {
            DOM.addTransaction(transaction)
        })
        
        DOM.updateBalance()
        Storage.set(Transactions.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()