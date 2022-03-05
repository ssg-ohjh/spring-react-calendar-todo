import { addDays, addMonths, endOfMonth, endOfWeek, format, getDay, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { useEffect, useLayoutEffect, useState } from 'react'
import { getTodoListMonthly, getTodoListByTodoDate } from './todo/TodoService'

import './Calendar.css'
import { isCompositeComponent } from 'react-dom/test-utils';

const Calendar = (props) => {

    const [ currentDate, setCurrrentDate ] = useState(new Date())
    const [ markToday, setMarkToday ] = useState(new Date())
    const [ todos, setTodos ] = useState([
        { title: "스프링및자바공부", todoDate: "2022-03-02", todoToken: "abcdefg" },
        { title: "이직을위한코딩테스트공부", todoDate: "2022-03-11", todoToken: "43e21ef" },
        { title: "리액트공부", todoDate: "2022-03-11", todoToken: "dsfaddd" },
        { title: "자료정리", todoDate: "2022-04-01", todoToken: "xfczcvx" },
        { title: "면접", todoDate: "2022-04-22", todoToken: "fdghhgf" },
    ])
    const [ loading, setLoading ] = useState(true)

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)

    const prevMonth = () => {
        setCurrrentDate(subMonths(currentDate, 1))
        setLoading(true)
        console.log('prevMonth')
    }

    const nextMonth = () => {
        setLoading(true)
        setCurrrentDate(addMonths(currentDate, 1))
        console.log('nextMonth')
    }

    const getTodoList = () => {
        const dateFormat = 'yyyy-MM-dd'
        const formattedStartDate = format(monthStart, dateFormat)
        const formattedEndDate = format(monthEnd, dateFormat)

        console.log('getTodoList')

        getTodoListMonthly(formattedStartDate, formattedEndDate).then((response) => {
            // console.log('response:: ', response)
            setTodos(response.todos)
        })
        setLoading(false)
    }

    const clickDay = (value) => {
        getTodoListByTodoDate(value).then((response) => {
            // console.log('response:: ', response)
            props.setTodosByDate(response.todos)
        })
        props.setClickedDate(value)
    }


    // useLayoutEffect(() => {
        // console.log('useEffect')
        // if(loading || props.loading){
        //     // const isLoading = true
        //     getTodoList(true)
        // }
    // }, [loading, props.loading])

    const header = () => {
        const dateFormat = 'yyyy년 MM월';

        return (
            <div className="header row flex-middle">
                <div className="col col-start">
                    <div className="icon" onClick={prevMonth}>
                        chevron_left
                    </div>
                </div>
                <div className="col col-content">
                    <span>
                        {format(currentDate, dateFormat)}
                    </span>
                </div>
                <div className="col col-end">
                    <div className="icon" onClick={nextMonth}>
                        chevron_right
                    </div>
                </div>
            </div>
        )
    }

    const daysOfWeek =() => {
        const dateFormat = 'eee'
        const days = []
        let startDate = startOfWeek(currentDate)

        for(let i=0; i<7; i++) {
            days.push(
                <div className='column col-center' key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            )
        }

        return <div className='days row'>{days}</div>

    }

    const groupingResponsedTodoByDay = () => {
        let todoListGroupByDay = {} //날짜를 key값으로 가지는 object
        let arrTodoTitle = [] //key값의 value를 배열로 등록(중복된 날짜의 value값 처리를 위해서)

        {todos.map((item, index) => {
            let todoDateDay = item.todoDate.slice(8, item.todoDate.length)
            if(isSameMonth(currentDate, new Date(item.todoDate))){
                arrTodoTitle.push(JSON.stringify({ "title": item.title, "todoDate": item.todoDate, "todoToken": item.todoToken }))

                if(todoListGroupByDay.hasOwnProperty(todoDateDay)){
                    todoListGroupByDay[todoDateDay].push(arrTodoTitle) //해당 key가 존재하면 value 배열에 추가
                }else {
                    todoListGroupByDay[todoDateDay] = arrTodoTitle
                }

                arrTodoTitle = []
            }
        })}
        return todoListGroupByDay
    }

    const cells = () => {
        const rows = []
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)
        const dayFormat = 'dd'
        const dateFormat = 'yyyy-MM-dd'

        let days = []
        let day = startDate
        let formattedDay = ''
        let formattedDate = ''

        let todoListGroupByDay = groupingResponsedTodoByDay()
        let lis = []

        while(day <= endDate) {
            for(let i=0; i<7; i++){
                // const cloneDay = day
                formattedDay = format(day, dayFormat)
                formattedDate = format(day, dateFormat)

                {Object.entries(todoListGroupByDay).map((items, index) => {
                    items[1].forEach((item, i) => {
                        if(JSON.parse(item).todoDate === formattedDate) {
                            lis.push(<li key={JSON.parse(item).todoToken}><span>{JSON.parse(item).title}</span></li>)
                        }
                    })
                })}

                days.push(
                    <div
                        className={
                            `column cell cell-${formattedDate} ${!isSameMonth(day, monthStart)
                            ? 'disabled'
                            : isSameDay(day, markToday)
                            ? 'selected'
                            : ''
                            }`
                        }
                        key={formattedDate}
                        onClick={clickDay.bind(null, formattedDate)}
                    >
                        <div className='day-top'>
                            <span className='number'>{formattedDay}</span>
                            <span className='bg'>{formattedDay}</span>
                            <div></div>
                        </div>
                        <div className='day-body'>
                            {/* <ul className='contents'>{formattedDay in todoListGroupByDay && lis}</ul> */}
                            <ul className='contents'>{isSameMonth(day, monthStart) && lis}</ul>
                        </div>
                    </div>
                )
                day = addDays(day, 1)
                lis = []
            }
            rows.push(
                <div className='row' key={day}>{days}</div>
            );
            days = []
        }
        // console.log('lis: ', lis)


        return (
            <div className='body'>{rows}</div>
        )
    }

    return (
        <div className='calendar'>
            <div>{header()}</div>
            <div>{daysOfWeek()}</div>
            <div>{cells()}</div>
        </div>
    )
}

export default Calendar;
