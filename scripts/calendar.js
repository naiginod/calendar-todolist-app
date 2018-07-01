class Application {
  constructor() {
    this.monthList = [
      'January', 
      'February', 
      'March', 
      'April', 
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    this.dayList = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]
    this.$monthSearch = $('#month_search');
  }

  createCalendar() {
    this.calendar = [];
    let date = new Date(2018, 0, 1);
    let currentMo = {};
    
    while (date.getFullYear() === 2018) { 
      if (jQuery.isEmptyObject(currentMo)) {
        let count = 0;
        currentMo['name'] = this.monthList[date.getMonth()];
        currentMo['dates'] = []
        while (count < date.getDay()) {
          currentMo['dates'].push({'date': ''});
          count++
        }
      }

      let prevMo = date.getMonth();
      currentMo['dates'].push({
        'date': date.getDate(),
        'day': this.dayList[date.getDay()],
        'month': this.monthList[date.getMonth()],
        'year': '2018',
        'items': [],
        'memo': '',
        'id': 0,
      });

      date.setDate(date.getDate() + 1);

      if (prevMo !== date.getMonth()) {
        this.calendar.push(currentMo)
        currentMo = {};
      }
    }
  } 

  renderMonthSearch() {
    Handlebars.registerPartial('month_search_template', $('#month_search_template').html())
    let monthSearchTemplate = Handlebars.compile($('#months_search_template').html());

    $('#month_search').html(monthSearchTemplate({calendar: this.calendar}));
    $('#month_search').hide();
  }

  renderDateSearch(month = this.calendar) {
    Handlebars.registerPartial('date_search_template', $('#date_search_template').html())
    let dateSearchTemplate = Handlebars.compile($('#dates_search_template').html());
    let dates = month[0]['dates'];

    $('#date_search').html(dateSearchTemplate({calendar: dates}));
    $('#date_search').hide();   
  }

  renderMonthDropdown() {
    Handlebars.registerPartial('month_dropdown_template', $('#month_dropdown_template').html())
    let monthDropdownTemplate = Handlebars.compile($('#months_dropdown_template').html());

    $('#month_dropdown').html(monthDropdownTemplate({calendar: this.calendar}));
  }

  renderCalendar(month = this.calendar) {
    Handlebars.registerPartial('date_template', $('#date_template').html());
    let calendarTemplate = Handlebars.compile($('#calendar_template').html());
    let dates = month[0]['dates'];

    $('#calendar').html(calendarTemplate({calendar: dates}))
  }

  renderTodolist(todos = this.calendar[0]['dates'][0]) {
    Handlebars.registerPartial('todo_template', $('#todo_template').html());
    let todoTemplate = Handlebars.compile($('#modal_template').html());
    console.log(todos)
    $('#modal').html(todoTemplate(todos));
    this.modalEvents(todos);
    $('#modal').css({
      'top': `${$(window).height()/2 - 250}px`,
      'left': `${$(window).width()/2 - 250}px`
    })
    $('#modal').show();

  }

  chooseMonth(month) {
    return this.calendar.filter (function (obj) {
      if (obj['name'] === month) { return obj; }
    })
  }

  hightlightMenu() {
    $('nav').on('mouseover', function(e) {
      $($(e.target).closest('li')[0]).addClass('highlight')
    })
    $('nav').on('mouseout', function(e) {
      $($(e.target).closest('li')[0]).removeClass('highlight')
    })
  }

  showMonthSearch() {
    let self = this;
    $('.search').on('click', function() {
      $('.search').addClass('highlight');
      $('#month_search').show();
      $('#month_search').on('mouseover', function(e) {
        $('.search').addClass('highlight');
        $('#month_search').show();
        $($(e.target).closest('li')[0]).on('mouseover', function() {
          self.renderDateSearch(self.chooseMonth($(this).attr('data-month')));
          $($(e.target).closest('li')[0]).addClass('highlight');
          $('#date_search').show();
          $('#date_search').css({
            "top": `110px`,
            "left": `${e.pageX - 20}px`
          })
          $('#date_search').on('mouseover', function(event) {
            $('#month_search').show();
            $('#date_search').show();
            $($(event.target).closest('li')[0]).addClass('highlight');
          })
          $('#date_search').on('click', function(event) {
            event.stopImmediatePropagation();

            let dayObj = self.findDate(event);
            self.renderTodolist(dayObj);
          })
          $('#date_search').on('mouseout', function(event) {
            $('#month_search').hide();
            $('#date_search').hide();
            $($(event.target).closest('li')[0]).removeClass('highlight');
          })
        })
        $($(e.target).closest('li')[0]).on('mouseout', function() {
          $($(e.target).closest('li')[0]).removeClass('highlight');
          $('#date_search').hide();
        })
      })
      $('#month_search').on('mouseout', function() {
        $('.search').removeClass('highlight');
        $('#month_search').hide();
      })
    })
  }

  propagateMonth() {
    let self = this;
    $('#month_dropdown').on('change', function(e) {
      self.renderCalendar(self.chooseMonth(e.target.value));
    })
  }

  findDate(event) {
    let $date = $($(event.target).closest('.info')[0]);
    let datesObj = this.calendar.filter (function(obj) {
      if (obj['name'] === $($date[0]).attr('data-month')) { return obj; }
    })[0]['dates']
    return datesObj.filter (function (obj) {
      if (obj['date'] === +$($date[0]).attr('data-date')) { return obj; }
    })[0]
  } 

  modalEvents(dayObj) {
    let self = this;
    
    function deleteTodo() {
      $('.delete').on('click', function(e) {
        e.stopPropagation();
        let todoId = +$($(e.target).closest('li')[0]).attr('data-id');
        dayObj['items'] = dayObj['items'].filter (function (obj) {
          if (obj['todoId'] !== todoId) { return obj; }
        })
        $(e.target).closest('li').remove();
      })
    }

    $('.add').on('click', function(e) {
      e.stopPropagation();
      dayObj['items'].push({
        todo: $('.todo_input')[0].value,
        todoId: dayObj['id']
      });

      $('#modal ul').append(`<li data-id=${dayObj['id']}><p>${$('.todo_input')[0].value}</p><div class='material-icons delete'>delete</div></li>`);
      dayObj['id']++
      $('.todo_input')[0].value = '';

      deleteTodo()
    })

    deleteTodo()

    $('#cancel').on('click', function(e) {
      self.renderCalendar(self.chooseMonth($('#month_dropdown')[0].value));
      $('#modal').hide();
    })

    $('.todo_submit').on('click', function(e) {
      e.stopPropagation();
      dayObj['memo'] = $('.memo_input')[0].value || '';
      $('#modal').hide();
      self.renderCalendar(self.chooseMonth($('#month_dropdown')[0].value));
    })
  }

  propagateTodolist() {
    let self = this;
    $('#calendar').on('click', function(e) {
      let dayObj = self.findDate(e);
      self.renderTodolist(dayObj);
    })
  }
}

$(function() {
  let app = new Application();
  app.createCalendar();
  app.renderMonthSearch();
  app.renderDateSearch();
  app.renderMonthDropdown();
  app.renderCalendar();
  app.showMonthSearch();
  app.hightlightMenu();
  app.propagateMonth();
  app.propagateTodolist();
});