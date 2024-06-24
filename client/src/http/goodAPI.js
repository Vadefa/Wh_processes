import {$host} from "./index";
const b_b = require('../b_b.js');

export const createGood= async (goodData) => {
    const {userId, string_date_of_arrival, string_models_id, string_goods_amount } = goodData
    if (string_goods_amount == '[]' || string_models_id == '[]')
    {
        return ''
    }
    const {data} = await $host.post('api/good', goodData)
    return data
}

export const deleteGood= async (arr_models_id, arr_model_names, arr_goods_amount) => {
    let result = ''
    let total_count = 0
    for(let i = 0; i < arr_goods_amount.length; i++){
        total_count += arr_goods_amount[i].length
    }
    if (total_count == 0){
        result = 'Вводимые данные некорректны.'
        return result
    }
    let names = 0
    for(let i = 0; i < arr_model_names.length; i++){
        total_count += arr_model_names[i].length
    }
    let response = ''
    let count  = 0
    let shelves = new Array()
    let models = new Array()
    let racks = new Array()

    // loop for each model
    for (let i = 0; i < arr_models_id.length; i++) {
        count = 0
        let sh = new Array()
        if (arr_goods_amount[i] > 1024)
            arr_goods_amount[i] = 1024
        // loop for each item of model
        for (let j = 0; j < arr_goods_amount[i]; j++) {
            let modelId = arr_models_id[i]
            response = await $host.delete('api/good/by_model/' + modelId)
            //if (response.data.message === 'OK')
            try{
                const resp = response.data.message.split(' ')
                if (resp[0] === 'OK'){
                    count += 1
                    sh.push(resp[1])
                    racks.push(resp[2])
                }
            }
            catch(e){
                continue;
            }
        }
        if (count > 0)
            models.push(arr_model_names[i])

        shelves.push(sh)
        if (count == arr_goods_amount[i])
            result += `${arr_goods_amount[i]} товаров модели "${arr_model_names[i]}" было удалено.\n`
        else if (count === 0)
            result += `Товаров модели "${arr_model_names[i]}" нет на складе.\n`
        else
            result += `${count} из ${arr_goods_amount[i]} товаров модели "${arr_model_names[i]}" было удалено. Товаров данной модели больше нет на складе.\n`
    }
    
    if (racks.length != 0 && racks.length < 60){
    //начало поиска опт. маршрута
       let a_models = models;
       let a_racks = racks;
       let way = '';
       result += "Оптимальный маршрут сбора товаров:"
       try{
           let m_shelves = new Array()
           for(let i = 0; i < shelves.length; i++){
               let sh_old = shelves[i][0];
               let sh = shelves[i][0];
               let m_count = 0;
               let i_shift = i == 0 ? 0 : shelves[i - 1].length;
               for(let j = 0; j < shelves[i].length; j++){
                   if (shelves[i][j] == sh)
                       m_count++;
                   else{
                       m_shelves.push([a_models[i], a_racks[i_shift + j], parseInt(sh), m_count])
                       sh = shelves[i][j];
                       m_count = 1;
                   }
               }
               if (sh_old != sh){
                m_shelves.push([a_models[i], a_racks[i_shift + shelves[i].length - 1], parseInt(sh), m_count])
               }
           }
           console.log("m_shelves");
           console.log(m_shelves);
           //сортировать m_shelves по номерам полок:
           m_shelves = m_shelves.sort(function (a, b) {
               return a[2] - b[2];
           });
           console.log("m_shelves_sorted");
           console.log(m_shelves);

           a_racks = Array.from(new Set(a_racks))
           const n = a_racks.length + 2;
           if (a_racks.length == 1){
                way = '\nТочка загрузкки/отгрузки -> Ст.' + a_racks[0].toString() + ':';
                for(let j = 0; j < m_shelves.length; j++){
                        let polka = m_shelves[j][2] % 8 + 1
                        way += '\n    · ' + m_shelves[j][3] + 'шт. ' + m_shelves[j][0].toString() + ': полка № ' + polka + ' (' + m_shelves[j][2].toString() + ');';
                }
                way += '\nСт. ' + a_racks[0].toString() + ' -> Точка загрузки/отгрузки.'
                result += way
            }   
           else{
               a_racks = a_racks.sort(function (a, b) {
                   return a - b;
               });
               let pr_matr = new Array(n);
               for(let i = 0; i < n; i++)
                   pr_matr[i] = new Array(n);
               pr_matr[0][0] = Infinity;
               pr_matr[0][1] = 0;
               pr_matr[1][0] = 0;
               for(let i = 2; i < n; i++){
                   pr_matr[0][i] = a_racks[i - 2];
                   pr_matr[i][0] = a_racks[i - 2];
               }
               //console.log(pr_matr);
               //теперь задаём веса
               const rack_length = 2;
               const line_width = 4;
               const rack_width = 4;
               for(let i = 1; i < n; i++){
                   for(let j = 1; j < n; j++){
                       if (i == j)
                           pr_matr[i][j] = Infinity;
                       else{
                           const first_line = Math.floor(pr_matr[i][0] / 4);
                           const second_line = Math.floor(pr_matr[0][j] / 4);
                           const first_pos = i % 4;
                           const second_pos = j % 4;
                           let distance;
                           if (first_line == second_line)
                               distance = 0 + Math.abs(first_pos - second_pos) * rack_length;
                           else if (Math.abs(first_line - second_line) == 1 && first_line % 2 == 1 && second_line % 2 == 0)
                               distance = 2 + Math.abs(first_pos - second_pos) * rack_length;
                           else
                               distance = Math.abs(second_line - first_line) * (line_width + rack_width) + Math.abs(first_pos - second_pos) * rack_length;
                           pr_matr[i][j] = distance;
                           pr_matr[j][i] = distance;
                       }
                   }
               }
               const travel = b_b.main(pr_matr);
               way = '\nТочка загрузкки/отгрузки -> Ст.' + travel[0][1].toString() + ':';
               for(let i = 0; i < m_shelves.length; i++){
                   if (travel[0][1] == m_shelves[i][1]){
                       let polka = m_shelves[i][2] % 8 + 1

                       way += '\n    · ' + m_shelves[i][3] + 'шт. ' + m_shelves[i][0].toString() + ': полка № ' + polka + ' (' + m_shelves[i][2].toString() + ');';
                   }
               }
               console.log("way");
               console.log(way);
               for(let i = 1; i < travel.length - 1; i++){
                   way += '\nСт.' + travel[i][0].toString() + ' -> Ст.' + travel[i][1].toString() + ':';
                   for(let j = 0; j < m_shelves.length; j++){
                       if (travel[i][1] == m_shelves[j][1]){
                           let polka = m_shelves[j][2] % 8 + 1
                           way += '\n    · ' + m_shelves[j][3] + 'шт. ' + m_shelves[j][0].toString() + ': полка № ' + polka + ' (' + m_shelves[j][2].toString() + ');';
                       }
                   }
               }
               way += '\nСт. ' + travel[travel.length - 1][0] + ' -> Точка загрузки/отгрузки.'
               console.log(way)
               result += way
               //конец поиска опт. маршрута
           }
       }
       catch(e){
           result += racks.length.toString() + '\n - число стеллажей. Оптимальный маршрут не найден:' + e.toString()
       }
    }
    console.log(shelves)
    return result
}