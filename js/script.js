document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const completedCheckbox = document.getElementById('completed-checkbox');
    completedCheckbox.addEventListener('change', function () {
        if (completedCheckbox.checked) {
            markAsCompleted();
        } else {
            markAsUncompleted();
        }
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

function isStorageExist() {
    if (typeof (Storage) === 'undefined') {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
    showToast("Data buku berhasil disimpan!");
});

function addBook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('name').value;
    const year = document.getElementById('date').value;
    const isCompleted = document.getElementById('completed-checkbox').checked;

    if (!isValidYear(year)) {
        alert('Tahun harus berupa angka 4 digit!');
        return;
    }

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, parseInt(year), isCompleted);
    books.push(bookObject);

    const container = makeBook(bookObject);
    const uncompletedBook = document.getElementById('todos');

    if (!isCompleted) {
        uncompletedBook.appendChild(container);
    } else {
        const completedBook = document.getElementById('completed-todos');
        completedBook.appendChild(container);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    document.getElementById('form').reset();
}

function isValidYear(year) {
    return /^\d{0,4}$/.test(year);
}

function generateId() {
    return new Date().getTime().toString();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id: id.toString(),
        title: title,
        author: author,
        year: year,
        isCompleted: isCompleted
    };
}

const books = [];
const RENDER_EVENT = 'render-todo';

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBook = document.getElementById('todos');
    uncompletedBook.innerHTML = '';

    const completedBook = document.getElementById('completed-todos');
    completedBook.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted)
            uncompletedBook.append(bookElement);
        else
            completedBook.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Penulis: " + bookObject.author;

    const textTimestamp = document.createElement('p');
    textTimestamp.innerText = "Tahun: " + bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textTimestamp);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.setAttribute('id', `todo-${bookObject.id}`);
    container.append(textContainer);

    if (!bookObject.isCompleted) {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        checkButton.addEventListener('click', function () {
            addTaskToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', function () {
            editBook(bookObject.id);
        });

        container.append(checkButton, trashButton, editButton);
    } else {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.addEventListener('click', function () {
            undoTitleFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', function () {
            editBook(bookObject.id);
        });

        container.append(undoButton, trashButton, editButton);
    }

    return container;
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTitleFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(todoId) {
    for (const index in books) {
        if (books[index].id === todoId) {
            return index;
        }
    }
    return -1;
}

function searchBooks() {
    const searchTerm = document.getElementById('search-title').value.toLowerCase();
    const searchResults = books.filter(book => book.title.toLowerCase().includes(searchTerm));

    renderSearchResults(searchResults);
}

function renderSearchResults(results) {
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = '';

    if (results.length === 0) {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.innerText = 'Tidak ada buku yang cocok ditemukan.';
        searchResultsContainer.appendChild(noResultsMessage);
    } else {
        results.forEach(result => {
            const resultElement = makeBook(result); 
            searchResultsContainer.appendChild(resultElement);
        });
    }
}


function showToast(message) {
    var toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(function() {
        toast.classList.remove("show");
    }, 3000);
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (const todo of data) {
            books.push(todo);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function editBook(todoId) {
    const todoElement = document.getElementById(`todo-${todoId}`);
    const todo = findBook(todoId);

    if (!todo) return;

    const textContainer = todoElement.querySelector('.inner');
    textContainer.innerHTML = '';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = todo.title;
    titleInput.classList.add('edit-input');
    textContainer.appendChild(titleInput);

    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.value = todo.author;
    authorInput.classList.add('edit-input');
    textContainer.appendChild(authorInput);

    const yearInput = document.createElement('input');
    yearInput.type = 'text';
    yearInput.value = todo.year;
    yearInput.classList.add('edit-input');
    textContainer.appendChild(yearInput);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('save-button');
    saveButton.addEventListener('click', function () {
        saveEditedBook(todoId, titleInput.value, authorInput.value, yearInput.value);
    });
    textContainer.appendChild(saveButton);

    const editButton = todoElement.querySelector('.edit-button');
    if (editButton) {
        editButton.style.display = 'none';
    }
}

function saveEditedBook(todoId, newTitle, newAuthor, newYear) {
    const todo = findBook(todoId);

    if (!todo) return;

    todo.title = newTitle;
    todo.author = newAuthor;
    todo.year = parseInt(newYear);

    if (!isValidYear(newYear)) {
        alert('Tahun harus berupa angka dengan panjang antara 0 hingga 4 digit!');
        return;
    }

    const todoElement = document.getElementById(`todo-${todoId}`);
    const editButton = todoElement.querySelector('.edit-button');
    if (editButton) {
        editButton.style.display = 'inline-block';
    }

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}
