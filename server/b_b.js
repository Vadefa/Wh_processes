
function m_copy(m){
    const n = m.length;
    const c = new Array(n);
    for (let i = 0; i < n; i++)
    {
        c[i] = new Array(n);
        c[i] = m[i].slice(0);
    }
    return c;
}

function prived(c)
{
    let n = c.length;
    let c_p = m_copy(c);
    let H = 0;
    for (let i = 1; i < n; i++)
    {
        let min = Infinity;
        for (let j = 1; j < n; j++)
            if (c_p[i][j] < min)
                min = c_p[i][j];
        if (min == Infinity)
            continue;
        for (let j = 1; j < n; j++)
        {
            if (c_p[i][j] != Infinity)
                c_p[i][j] -= min;
        }
        H += min;
    }
    for (let i = 1; i < n; i++)
    {
        let min = Infinity;
        for (let j = 1; j < n; j++)
            if (c_p[j][i] < min)
                min = c_p[j][i];
        if (min == Infinity)
            continue;
        for (let j = 1; j < n; j++)
        {
            if (c_p[j][i] != Infinity)
                c_p[j][i] -= min;
        }
        H += min;
    }
    return [c_p, H];
}


function V (positive, w, c, travel){
    this.positive = positive,
    this.w = w,
    this.c = c,
    this.travel = travel;
}

//Цикл метода ветвей и границ
function b_b(Q, vers, best, iter)
{
    //console.log("b_b" + iter);
    if (vers.length == 0){
        console.log("Вершин больше нет")
        return best;
    }

    if (iter > 5000){
        console.log('iter > 5000 ' + iter.toString())
        console.log(vers.length)
        return best;
    }

    let v = vers[0];
    let del_ind = 0;
    for (let i = 1; i < vers.length; i++)
        if (vers[i].w < v.w)
            del_ind = i;
    v = vers[del_ind];
    vers.splice(del_ind, 1);
    //console.log(v)

    if (v.w >= Q){  //Если вершина с весом, НАИМЕНЬШИМ СРЕДИ ВСЕХ ВИСЯЧИХ, больше, чем Q, то остальные точно уже не подойдут
        console.log("У текущего недоведённого решения вес больше, чем у наилучшего найденного")
        console.log(best)
        return best;
    }

    let n = v.c.length;
    var c_p = v.c;


    //если вершина негативная, то заново выполняем приведение
    let ong = 0;
    if (v.positive == false)
        [c_p, ong] = prived(c_p);
    v.w += ong;

    //1. Среди всех клеток с нулевыми значениями ищем клетку с максимальным argmax
    console.log("start" + iter.toString())
    // console.log(c_p)
    let argmax = 0;
    let nuller = [0, 0];
    for (let i = 1; i < n; i++)
        for (let  j = 1; j < n && argmax != Infinity; j++)
        {
            if (c_p[i][j] == 0)
            {
                let min_i = Infinity;
                let min_j = Infinity;
                for (let k = 1; k < n && min_i != 0; k++)
                {
                    if (j == k) continue;
                    if (c_p[i][k] < min_i)
                        min_i = c_p[i][k];
                }
                for (let k = 1; k < n && min_j != 0; k++)
                {
                    if (i == k) continue;
                    if (c_p[k][j] < min_j)
                        min_j = c_p[k][j];
                }
                if (min_i == Infinity || min_j == Infinity)
                    {
                        argmax = Infinity;
                        nuller = [i, j];
                        break;
                    }
                if (argmax < min_i + min_j || ((min_i + min_j) == 0 && (nuller[0] == 0 && nuller[1] == 0)))
                {
                    console.log(min_i.toString() + " - min_i, " + min_j.toString() + " - min_j")
                    argmax = min_i + min_j;
                    nuller = [i, j];
                }
            }
        }
    console.log("argmax:" + argmax.toString())
    console.log('nuller', nuller);
    console.log('приведённая', c_p);
    let c_p_neg = m_copy(c_p);
    c_p_neg[nuller[0]][nuller[1]] = Infinity;
    console.log('матрица для негативной вершины', c_p_neg);
    //предотвращаем зацикливание
    let col = c_p[0].findIndex(el => el === c_p[nuller[0]][0]);
    let row = -1;
    let row_p = c_p[0][nuller[1]];
    for (let i = 0; i < n && i <= c_p[0][nuller[1]]; i++)
        if (row_p == c_p[i][0])
        {
            row = i;
            break;
        }
    if (row != -1 && col != -1)
        c_p[row][col] = Infinity;
    console.log('row & col:', nuller, [row, col]);
    console.log('матрица без зацикливаний c_p', c_p);

    //удаляем строку номер nuller.item1 и столбец номер nuller.item2
    let c_new = Array(n - 1);
    let shift = 0;
    for (let i = 0; i < n; i++)
    {
        if (i == nuller[0])
        {
            shift = -1;
            continue;
        }
        c_new[i + shift] = new Array(n - 1);
        let shift_j = 0;
        for (let j = 0; j < n; j++)
        {
            if (j == nuller[1]){
                shift_j = -1;
                continue;
            }
            c_new[i + shift][j + shift_j] = c_p[i][j];
        }
    }
    //новая матрица готова
    let H1 = v.w + argmax;      // НГЦФ для негативного узла - если мы сохраняем вершину
                                // H2 - НГЦФ для позитивного узла - если мы убираем вершину. Тогда ищем новую H в новой матрице
    let c_new_p;
    let H2;
    [c_new_p, H2] = prived(c_new);
    H2 += v.w;

    console.log("v.travel, который идёт в left:")
    console.log(v.travel)
    console.log(c_p_neg)

    let left = new V(false, H1, c_p_neg, v.travel.slice(0));
    let right = new V(true, H2, c_new_p, v.travel.slice(0));
    right.travel.push([c_p[nuller[0]][0], c_p[0][nuller[1]]]);

    if (H1 >= Q && H2 >= Q){
        console.log("Решение найдено, но оно не лучше прежнего")
        return b_b(Q, vers, best, iter+1);
    }
    //Если мы тут, то какой-то из H1 или H2 точно меньше, чем Q
    let cur = H2 <= H1 ? right : left;
    if (cur.c.length <= 2)
    {
        console.log("cur>c>length <= 2")
        let s_way = new Array();
        let us_way = cur.travel.slice(0);
        console.log(s_way)
        console.log(us_way)
        for (let i = 0; i < us_way.length && s_way.length == 0; i++)
        {
            if (us_way[i][0] == 0)
            {
                s_way.push(us_way[i]);
                us_way.splice(i, 1);
            }
        }
        console.log(s_way)
        console.log(us_way)
        let flag = true
        while (us_way.length > 0 && flag == true)
        {
            let l = us_way.length;
            for(let i = 0; i < us_way.length; i++)
            {
                if (us_way[i][0] == s_way[s_way.length - 1][1])
                {
                    s_way.push(us_way[i]);
                    us_way.splice(i, 1);
                    break;
                }
            }
            if (l == us_way.length){
                flag = false
            }
        }    
        if (flag == false){
            console.log("Решение даёт циклы.")
            let rest = cur == right ? left : rught
            vers.push(rest)
            return b_b(Q, vers, best, iter+1);
        }
        else{
            console.log("Решение найдено и оно лучше прежнего")
            cur.travel.push([cur.c[1][0], cur.c[0][1]]);
            cur.w += cur.c[1][1];
            best = cur;
            Q = cur.w;
            //Если матрица уже двумерная, при этом Q > cur.w, то оставшаяся вершина точно хуже, чем cur и её отсекаем
            return b_b(Q, vers, best, iter+1);
            }
    }
    //иначе просто продолжаем с вершиной получше.
    else
    {
        console.log("Продолжаем поиск решения")
        vers.push(right);
        if (left.w < Infinity)
            vers.push(left);
        return b_b(Q, vers, best, iter+1);
    }
}
//Конец цикла
function main(c)
{
    // console.log("начинаем поиск оптимального маршрута")
    // const c = [
    //     [Infinity, 1, 2, 3, 4],
    //     [1, Infinity, 13, 4, 10],
    //     [2, 42, Infinity, 8, 9],
    //     [3, 8, 5, Infinity, 12],
    //     [4, 21, 3, 9, Infinity]
    // ];
    const n = c.length;
          // константа приведения
    let c_p;
    let H; 
    [c_p, H] = prived(c);
    // console.log("приведённая:");
    // console.log(c_p);
    let vers = new Array();
    let root = new V(true, H, c_p, null);          // корневая вершина
    let argmax = 0;
    let nuller = [0, 0];
    for (let i = 1; i < n && argmax != Infinity; i++)
        for (let  j = 1; j < n; j++)
        {
            if (c_p[i][j] == 0)
            {
                let min_i = Infinity;
                let min_j = Infinity;
                for (let k = 1; k < n && min_i != 0; k++)
                {
                    if (j == k) continue;
                    if (c_p[i][k] < min_i)
                        min_i = c_p[i][k];
                }
                for (let k = 1; k < n && min_j != 0; k++)
                {
                    if (i == k) continue;
                    if (c_p[k][j] < min_j)
                        min_j = c_p[k][j];
                }
                if (min_i == Infinity || min_j == Infinity)
                    {
                        argmax = Infinity;
                        nuller = [i, j];
                        break;
                    }
                if (argmax < min_i + min_j || ((min_i + min_j) == 0 && (nuller[0] == 0 && nuller[1] == 0)))
                    {
                        console.log(min_i.toString() + " - min_i, " + min_j.toString() + " - min_j")
                        argmax = min_i + min_j;
                        nuller = [i, j];
                    }
            }
        }
    console.log("argmax:" + argmax.toString())
    console.log('nuller', nuller);
    console.log('приведённая', c_p);
    let c_p_neg = m_copy(c_p);
    c_p_neg[nuller[0]][nuller[1]] = Infinity;
    console.log('для негативной вершины', c_p_neg);
    //предотвращаем зацикливание
    let col = c_p[0].findIndex(el => el === c_p[nuller[0]][0]);
    let row = -1;
    let row_p = c_p[0][nuller[1]];
    for (let i = 0; i < n && i <= c_p[0][nuller[1]]; i++)
        if (row_p == c_p[i][0])
        {
            row = i;
            break;
        }
    console.log('row&col', [row, col]);
    if (row != -1 && col != -1)
        c_p[row][col] = Infinity;
    console.log('без зацикливания', c_p);
    //удаляем строку номер nuller[0] и столбец номер nuller[1]
    let c_new = Array(n - 1);
    let shift = 0;
    for (let i = 0; i < n; i++)
    {
        if (i == nuller[0])
        {
            shift = -1;
            continue;
        }
        c_new[i + shift] = new Array(n - 1);
        let shift_j = 0;
        for (let j = 0; j < n; j++)
        {
            if (j == nuller[1]){
                shift_j = -1;
                continue;
            }
            c_new[i + shift][j + shift_j] = c_p[i][j];
        }
    }
    // console.log(c_new);

    //новая матрица готова
    let H1 = H + argmax;        // НГЦФ для негативного узла - если мы сохраняем вершину
    let H2 = 0;                 // НГЦФ для позитивного узла - если мы убираем вершину. Тогда ищем новую H в новой матрице
    let c_new_p;
    [c_new_p, H2] = prived(c_new);
    H2 += H;
    let left = new V(false, H1, c_p_neg, new Array());
    let right = new V(true, H2, c_new_p, new Array());
    right.travel.push([c_p[nuller[0]][0], c_p[0][nuller[1]]]);
    if (H1 > H2)
    {
        vers.push(left);
        vers.push(right);
    }
    else
    {
        vers.push(right);
        vers.push(left);
    }
    let opt = b_b(Infinity, vers, null, 0);
    console.log("вернулись из b_b")
    console.log(opt)
    let s_way = new Array();
    let us_way = opt.travel;
    console.log(s_way)
    console.log(us_way)
    for (let i = 0; i < us_way.length && s_way.length == 0; i++)
    {
        if (us_way[i][0] == 0)
        {
            s_way.push(us_way[i]);
            us_way.splice(i, 1);
        }
    }
    console.log(s_way)
    console.log(us_way)
    while (us_way.length > 0)
    {
        for(let i = 0; i < us_way.length; i++)
        {
            if (us_way[i][0] == s_way[s_way.length - 1][1])
            {
                s_way.push(us_way[i]);
                us_way.splice(i, 1);
                break;
            }
        }
    }
    console.log(opt.w + " - длина оптимального маршрута. Маршрут:");
    for (let i = 0; i < s_way.length - 1; i++)
        console.log(s_way[i] + ", ");
    console.log(s_way[s_way.length - 1] + ".");
    return s_way;
}

// let c_c = [
//     [ Infinity, 0, 38, 39, 40, 82 ],
//     [ 0, Infinity, 74, 76, 82, 94 ],
//     [ 38, 74, Infinity, 2, 12, 42 ],
//     [ 39, 76, 2, Infinity, 14, 40 ],
//     [ 40, 82, 12, 14, Infinity, 36],
//     [ 82, 94, 42, 40, 36, Infinity]
//   ]
// // main(c)
// // console.log('OK 426'.split(' ')[0])

// let c = [
//     [
//       Infinity,  0, 63,
//             64, 65, 66,
//             67, 68, 69,
//             70, 71, 72,
//             73, 74, 75
//     ],
//     [
//         0, Infinity, 122,
//       132,      130, 128,
//       130,      140, 138,
//       136,      138, 148,
//       146,      144, 146
//     ],
//     [
//       63, 122, Infinity,
//       10,  12,       10,
//        8,  18,       20,
//       18,  16,       26,
//       28,  26,       24
//     ],
//     [
//             64, 132, 10,
//       Infinity,   6,  4,
//              2,   2,  8,
//              6,   4, 16,
//             22,  20, 18
//     ],
//     [
//       65,      130, 12,
//        6, Infinity,  2,
//        4,        8,  2,
//        4,        6, 22,
//       16,       18, 20
//     ],
//     [
//       66, 128,       10,
//        4,   2, Infinity,
//        2,   6,        4,
//        2,   4,       20,
//       18,  16,       18
//     ],
//     [
//             67, 130,  8,
//              2,   4,  2,
//       Infinity,   4,  6,
//              4,   2, 18,
//             20,  18, 16
//     ],
//     [
//       68,      140, 18,
//        2,        8,  6,
//        4, Infinity,  6,
//        4,        2,  8,
//       14,       12, 10
//     ],
//     [
//       69, 138,       20,
//        8,   2,        4,
//        6,   6, Infinity,
//        2,   4,       14,
//        8,  10,       12
//     ],
//     [
//             70, 136, 18,
//              6,   4,  2,
//              4,   4,  2,
//       Infinity,   2, 12,
//             10,   8, 10
//     ],
//     [
//       71,      138, 16,
//        4,        6,  4,
//        2,        2,  4,
//        2, Infinity, 10,
//       12,       10,  8
//     ],
//     [
//       72, 148,       26,
//       16,  22,       20,
//       18,   8,       14,
//       12,  10, Infinity,
//        6,   4,        2
//     ],
//     [
//             73, 146, 28,
//             22,  16, 18,
//             20,  14,  8,
//             10,  12,  6,
//       Infinity,   2,  4
//     ],
//     [
//       74,      144, 26,
//       20,       18, 16,
//       18,       12, 10,
//        8,       10,  4,
//        2, Infinity,  2
//     ],
//     [
//       75, 146,       24,
//       18,  20,       18,
//       16,  10,       12,
//       10,   8,        2,
//        4,   2, Infinity
//     ]
//   ]
// main(c)

module.exports = {main}