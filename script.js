document.addEventListener('DOMContentLoaded', () => {
    const newTaskButton = document.getElementById('new-task-button');
    const newTaskButtonMobile = document.getElementById('new-task-button-mobile');
    const taskModal = document.getElementById('task-modal');
    const cancelButton = document.getElementById('cancel-button');
    const taskForm = document.getElementById('task-form');
    const editTaskModal = document.getElementById('edit-task-modal');
    const editCancelButton = document.getElementById('edit-cancel-button');
    const editTaskForm = document.getElementById('edit-task-form');
    const columns = document.querySelectorAll('.column');

    const taskTitle = document.getElementById('task-title');
    const taskDescription = document.getElementById('task-description');
    const taskAssigned = document.getElementById('task-assigned');
    const taskPriority = document.getElementById('task-priority');
    const taskStatus = document.getElementById('task-status');
    const taskDeadline = document.getElementById('task-deadline');

    const editTaskTitle = document.getElementById('edit-task-title');
    const editTaskDescription = document.getElementById('edit-task-description');
    const editTaskAssigned = document.getElementById('edit-task-assigned');
    const editTaskPriority = document.getElementById('edit-task-priority');
    const editTaskStatus = document.getElementById('edit-task-status');
    const editTaskDeadline = document.getElementById('edit-task-deadline');
    const eliminarTask = document.getElementById('eliminar-tarea');
    const eliminarConfirmarModal = document.getElementById('confirmar-eliminar');
    const siEliminar = document.getElementById('si-eliminar');
    const noEliminar = document.getElementById('no-eliminar');
    let currentTaskDiv = null;

    function clearAllColumns() {
        columns.forEach(column => {
            const taskListContent = column.querySelector('.task-list-content');
            if (taskListContent) {
                taskListContent.innerHTML = '';
            }
        });
    }

    async function getTasksFromServer() {
        let info;
        try {
            const response = await fetch(`http://localhost:3000/api/tasks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            info = data;
            console.log(info);
            return info;
        } catch(error) {
            console.log(error);
        }
    }

    async function submitTaskToServer(task) {
        try {
            await fetch(`http://localhost:3000/api/tasks`, {
                method: 'POST',
                body: JSON.stringify(task),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            await showTasksInColumns();
        } catch(error) {
            console.log(error);
        }
    }

    async function editTaskInServer(task, taskDiv) {
        try {
            await fetch(`http://localhost:3000/api/tasks/${taskDiv.getAttribute('data-id')}`, {
                method: 'PUT',
                body: JSON.stringify(task),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            await showTasksInColumns();
        } catch(error) {
            console.log(error);
        }
    }

    async function deleteTaskFromServer(task, taskDiv) {
        try {
            await fetch(`http://localhost:3000/api/tasks/${taskDiv.getAttribute('data-id')}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            await showTasksInColumns();
        } catch(error) {
            console.log(error);
        }
    }

    async function showTasksInColumns() {
        try {
            clearAllColumns();
            let tasks = await getTasksFromServer();
            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'box';
                taskDiv.setAttribute('data-id', task.id);
                taskDiv.setAttribute('data-title', task.title);
                taskDiv.setAttribute('data-description', task.description);
                taskDiv.setAttribute('data-assigned', task.assignedTo);
                taskDiv.setAttribute('data-priority', task.priority == 'High' 
                    ? 'Alta' 
                    : task.priority == 'Medium' 
                    ? 'Media' 
                    : 'Baja');
                taskDiv.setAttribute('data-status', task.status.toLowerCase().replace(' ', '-'));
                let date = task.endDate.includes('/') ? task.endDate.split('/').reverse().join('-') : task.endDate;
                taskDiv.setAttribute('data-deadline', date);
                taskDiv.setAttribute('draggable', 'true');
                taskDiv.innerHTML = `<strong>${task.title}</strong><p>${task.description}</p>`;

                taskDiv.style.backgroundColor = taskDiv.getAttribute('data-priority') == 'Alta'
                    ? '#ffcccc'
                    : taskDiv.getAttribute('data-priority') == 'Media'
                    ? '#ffffab'
                    : '#ddffdd';
    
                const column = document.getElementById(task.status.toLowerCase().replace(' ', '-'));
                if (column) {
                    column.querySelector('.task-list-content').appendChild(taskDiv);
    
                    taskDiv.addEventListener('dragstart', () => {
                        taskDiv.classList.add('is-dragging');
                    });
    
                    taskDiv.addEventListener('dragend', () => {
                        taskDiv.classList.remove('is-dragging');
                    });
    
                    taskDiv.addEventListener('click', () => openEditModal(taskDiv));
                }
            });
        } catch (error) {
            console.log(error);
        }
    }        
    
    showTasksInColumns();

    newTaskButton.addEventListener('click', () => {
        clearForm();
        taskModal.classList.add('is-active');
    });

    newTaskButtonMobile.addEventListener('click', () => {
        clearForm();
        taskModal.classList.add('is-active');
    });

    cancelButton.addEventListener('click', closeModal);
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    editCancelButton.addEventListener('click', closeEditModal);
    document.getElementById('edit-modal-close').addEventListener('click', closeEditModal);

    function closeModal() {
        taskModal.classList.remove('is-active');
    }

    function closeEditModal() {
        editTaskModal.classList.remove('is-active');
    }

    function closeConfirmModal() {
        eliminarConfirmarModal.classList.remove('is-active');
    }

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const taskDiv = document.createElement('div');
        taskDiv.className = 'box';
        taskDiv.setAttribute('data-title', taskTitle.value);
        taskDiv.setAttribute('data-description', taskDescription.value);
        taskDiv.setAttribute('data-assigned', taskAssigned.value);
        taskDiv.setAttribute('data-priority', taskPriority.value);
        taskDiv.setAttribute('data-status', taskStatus.value);
        taskDiv.setAttribute('data-deadline', taskDeadline.value);
        taskDiv.setAttribute('draggable', 'true');
        taskDiv.innerHTML = `<strong>${taskTitle.value}</strong><p>${taskDescription.value}</p>`;

        let taskJson = jsonifyTask(taskDiv);
        console.log(taskJson);
        await submitTaskToServer(taskJson);

        taskDiv.addEventListener('dragstart', () => {
            taskDiv.classList.add('is-dragging');
        });

        taskDiv.addEventListener('dragend', () => {
            taskDiv.classList.remove('is-dragging');
        });

        taskDiv.addEventListener('click', () => openEditModal(taskDiv));

        closeModal();
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(column, e.clientY);
            const taskList = column.querySelector('.task-list-content');
            const draggingTask = document.querySelector('.is-dragging');
            if (afterElement == null) {
                taskList.appendChild(draggingTask);
            } else {
                taskList.insertBefore(draggingTask, afterElement);
            }
        });

        column.addEventListener('drop', (e) => {
            const draggingTask = document.querySelector('.is-dragging');
            if (draggingTask) {
                const newStatus = column.id;
                draggingTask.setAttribute('data-status', newStatus);
                let taskJson = jsonifyTask(draggingTask);
                editTaskInServer(taskJson, draggingTask);
            }
        });
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.box:not(.is-dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function openEditModal(taskDiv) {
        currentTaskDiv = taskDiv;
        editTaskTitle.value = taskDiv.getAttribute('data-title');
        editTaskDescription.value = taskDiv.getAttribute('data-description');
        editTaskAssigned.value = taskDiv.getAttribute('data-assigned');
        editTaskPriority.value = taskDiv.getAttribute('data-priority');
        editTaskStatus.value = taskDiv.getAttribute('data-status');
        editTaskDeadline.value = taskDiv.getAttribute('data-deadline');
        editTaskModal.classList.add('is-active');
    }

    function jsonifyTask(taskDiv) {
        let newTask = {};
        newTask['assignedTo'] = taskDiv.getAttribute('data-assigned');
        newTask['comments'] = [];
        newTask['description'] = taskDiv.getAttribute('data-description');
        newTask['endDate'] = taskDiv.getAttribute('data-deadline');
        let priority = taskDiv.getAttribute('data-priority') == 'Alta' 
            ? 'High' 
            : taskDiv.getAttribute('data-priority') == 'Media' 
            ? 'Medium' 
            : 'Low';
        newTask['priority'] = priority;
        newTask['startDate'] = null;
        newTask['status'] = taskDiv.getAttribute('data-status').replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        newTask['title'] = taskDiv.getAttribute('data-title');

        return newTask
    }

    editTaskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        currentTaskDiv.setAttribute('data-title', editTaskTitle.value);
        currentTaskDiv.setAttribute('data-description', editTaskDescription.value);
        currentTaskDiv.setAttribute('data-assigned', editTaskAssigned.value);
        currentTaskDiv.setAttribute('data-priority', editTaskPriority.value);
        currentTaskDiv.setAttribute('data-status', editTaskStatus.value);
        currentTaskDiv.setAttribute('data-deadline', editTaskDeadline.value);
        currentTaskDiv.innerHTML = `<strong>${editTaskTitle.value}</strong><p>${editTaskDescription.value}</p>`;

        let taskJson = jsonifyTask(currentTaskDiv);
        editTaskInServer(taskJson, currentTaskDiv);


        const column = document.getElementById(editTaskStatus.value);
        if (column) {
            column.querySelector('.task-list-content').appendChild(currentTaskDiv);
        }

        closeEditModal();
    });

    eliminarTask.addEventListener('click', () => {
        eliminarConfirmarModal.classList.add('is-active');
        closeEditModal();
    })

    siEliminar.addEventListener('click', () => {
        let taskJson = jsonifyTask(currentTaskDiv);
        deleteTaskFromServer(taskJson, currentTaskDiv);
        closeConfirmModal();
    })

    noEliminar.addEventListener('click', () => {
        closeConfirmModal();
    })

    function clearForm() {
        taskTitle.value = '';
        taskDescription.value = '';
        taskAssigned.selectedIndex = 0;
        taskPriority.selectedIndex = 0;
        taskStatus.selectedIndex = 0;
        taskDeadline.value = '';
    }
});
