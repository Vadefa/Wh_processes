import React from 'react';
import classes from './Tab.module.css';
import TabLine from './TabLine';
import {observer} from "mobx-react-lite";

const TabCard = observer(({first_shelf}) => {
    const get_numbers = (f) => {
        let arr = []
        for (let i = 0; i < 4; i++) {
            arr.push(f + 32 * i)
        }
        // let cube = [
        //     [[[],[],[],[]], [[],[],[],[]]],
        //     [[[],[],[],[]], [[],[],[],[]]],
        //     [[[],[],[],[]], [[],[],[],[]]],
        //     [[[],[],[],[]], [[],[],[],[]]]
        // ]
        // for (let m = 0; m < 4; m++) { // each line of 2 cubes
        //     for (let i = 0; i < 4; i++) { // 4 rows
        //         let first_row = (i%4>=2) ? arr[m] + (i - 1) + 15 : arr[m] + (i % 2)
        //         for (let j = 0; j < 2; j++) { // 2 cubes
        //             for (let k = 0; k < 4; k++) { // 4 cells in each row of each cube
        //                 let number = first_row + 2 * k + 8 * j
        //                 cube[m][j][i].unshift(number)
        //             }
        //         }
        //     }
        // }

        //синие скобки - целая линия из двух рядов стеллажей. жёлтые - ряды, фиолетовые - столбцы
        let cube2 = [
            [[[],[],[],[]], [[],[],[],[]]],
            [[[],[],[],[]], [[],[],[],[]]],
            [[[],[],[],[]], [[],[],[],[]]],
            [[[],[],[],[]], [[],[],[],[]]]
        ]
        for(let i = 0; i < 2; i++){         //для каждого из 2 кубов (куб - это ряд. Первый куб - верхний ряд, второй - нижний)
            for(let j = 0; j < 4; j++){     //строка
                for(let k = 0; k < 4; k++){ //столбец
                    for(let l = 0; l < 4; l++){
                        if (l < 2)
                            cube2[j][i][k].unshift(arr[i * 2 + Math.floor(l / 2) % 2] + 8 * j + 2 * k + l % 2);
                        else
                            cube2[j][i][k].unshift(arr[i * 2 + Math.floor(l / 2) % 2] + 8 * j + 2 * k + l % 2);
                    }
                }
            }
        }
        console.log(cube2)
        return cube2
    }
    let row_num = get_numbers(first_shelf)
    // const array = get_numbers(1)
    return (
        <div className={classes.tab}>
            {
                row_num.map((column) => {
                    return <TabLine array={column}/>
                })
            }
        </div>
    );
})

export default TabCard;