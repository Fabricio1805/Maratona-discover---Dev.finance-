// abrir e fechar o modal
const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
            document.querySelector('.modal-overlay').classList.remove('active')
    }
}
// salvando os dados no navegador  
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("finances:transactions",JSON.stringify(transactions))

    }
}
// operações que a aplicação irá fazer
const operations  = {
    all: Storage.get(),
    //adicionando transações
    add(transaction){
        operations.all.push(transaction)
        App.reload()
    },
    //removendo transações
    remove(index){
        operations.all.splice(index, 1)  
        App.reload()
    },
    //somar as entradas 
    incomes(){
        let income = 0 
        operations.all.forEach(transactions =>{
            if(transactions.amount > 0){
                income += transactions.amount;
            }
        })
    
        return income;
    },
    //somar as saidas
    expenses(){
        let expense = 0
        operations.all.forEach(transactions => {
            if(transactions.amount < 0){
                expense += transactions.amount;
            }
        })
        
        return expense 
    },
    //total das entradas - saidas
    total(){
        return operations.incomes() + operations.expenses()
    }
}
//pegando os dados do HTML
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transactions, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)

        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr)
    },
  
    innerHTMLTransaction(transactions, index){

        const CSSclass = transactions.amount > 0 ? "income":"expense"

        const amount = Utils.formatCurrency(transactions.amount) 

        const html = 
        `
            <td class="description">${transactions.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transactions.date}</td>
            <td>
                <img onclick="operations.remove(${index})" src="/image/minus.svg" alt="Remover a transação">
            </td>       
        `
        return html
    },

    updateBalance(){
        document.getElementById('incomesDisplay').innerHTML = Utils.formatCurrency(operations.incomes())
        document.getElementById('expensesDisplay').innerHTML = Utils.formatCurrency(operations.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(operations.total())
    },
    clearTransaction(){
        DOM.transactionsContainer.innerHTML = ""
    },
}
// formatado os numeros para a moeda REAL
const Utils = {
    formatAmount(value){
        value = value * 100
        return Math.round(value)
    },
    formatDate(date){
        const splitteDate = date.split("-")
        return `${splitteDate[2]}/${splitteDate[1]}/${splitteDate[0]}`
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-":""

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100 

        value = value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}
// formulário 
const Form = { 
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getvalue(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value 
        }
    },
    validateField(){
        const {description, amount, date} = Form.getvalue()
        if(description.trim() === "" 
            || amount.trim() === "" 
            || date.trim() === ""){
                throw new Error("por favor,preencha todos os campos!")
        }
    },
    formatValues(){
        let {description, amount, date} = Form.getvalue()

        amount = Utils.formatAmount(amount)
       
        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date,
        }
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event){
        event.preventDefault()

        try{
            Form.validateField()
            const transaction = Form.formatValues()
            operations.add(transaction)
            Form.clearFields()
            Modal.close()
        }catch(error){
            alert(error.message)
        }
       
    }
}
//iniciando a aplicação
const App = {
    init(){

        // Repetição para add as transações
        operations.all.forEach((transactions,index) =>{
        DOM.addTransaction(transactions,index)
        })

        DOM.updateBalance()

        Storage.set(operations.all)
    },
    reload(){
        DOM.clearTransaction()
        App.init()
    },
}
App.init()

