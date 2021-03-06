export default class Matrix<R extends number = 1, C extends number = 1> {
    #r: R;
    #c: C;
    #data: number[];

    constructor(r?: R, c?: C, data?: number[]) {
        r = r && r > 0 ? r : 1 as R;
        c = c && c > 0 ? c : 1 as C;
        this.#data = data ? data.concat() : [];
        this.#r = r;
        this.#c = c;
    }

    static number(n: number) {
        return new Matrix(1, 1, [n]);
    }

    static unit<D extends number>(n: D) {
        let res = new Matrix(n, n);
        for (let i = 0; i < n; ++i) {
            res.#data[i * n + i] = 1;
        }
        return res;
    }

    get rows() {
        return this.#r;
    }

    get columns() {
        return this.#c;
    }

    val(x: number, y: number) {
        return this.#data[y * this.#c + x] || 0;
    }

    [Symbol.toPrimitive](hint: string) {
        if (hint === 'number')
            return this.val(0, 0);
        return this.toString();
    }

    toString() {
        const len = this.#r * this.#c, maxX = this.#c - 1;
        let lines = [], line = [];
        for (let i = 0; i < len; ++i) {
            line.push(this.#data[i] || 0);
            if (i % this.#c === maxX) {
                lines.push(`|${line.join(',')}|`);
                line = [];
            }
        }
        return lines.join('\n');
    }

    getRow(r: number) {
        if (r < 0 || r >= this.#r) throw RangeError("wrong row index");
        let res = new Matrix(1, this.#c);
        for (let i = 0; i < this.#c; ++i) {
            res.#data[i] = this.val(i, r);
        }
        return res;
    }

    getColumn(c: number) {
        if (c < 0 || c >= this.#c) throw RangeError("wrong column index");
        let res = new Matrix(this.#r, 1);
        for (let i = 0; i < this.#r; ++i) {
            res.#data[i] = this.val(c, i);
        }
        return res;
    }

    reshape<NewR extends number, NewC extends number>(r: NewR, c: NewC) {
        return new Matrix(r, c, this.#data);
    }

    add(mat: Matrix<R, C>) {
        let res = new Matrix(this.#r, this.#c);
        const dlen = this.#r * this.#c;
        for (let i = 0; i < dlen; ++i) {
            res.#data[i] = this.#data[i] + mat.#data[i];
        }
        return res;
    }

    multiply<NewC extends number>(mat: Matrix<C, NewC>) {
        let res = new Matrix(this.#r, mat.#c);
        for (let r = 0; r < this.#r; ++r) {
            for (let c = 0; c < mat.#c; ++c) {
                let left = this.getRow(r);
                let right = mat.getColumn(c);
                let product = 0;
                for (let i = 0; i < this.#c; ++i) {
                    product += left.val(i, 0) * right.val(0, i);
                }
                res.#data[r * mat.#c + c] = product;
            }
        }
        return res;
    }

    hadamard(mat: Matrix<R, C>): Matrix<R, C> {
        let res = new Matrix(this.#r, this.#c);
        const dlen = this.#r * this.#c;
        for (let i = 0; i < dlen; ++i) {
            res.#data[i] = this.#data[i] * mat.#data[i];
        }
        return res;
    }

    get transpose() {
        let res = new Matrix(this.#c, this.#r);
        let dataIdx = 0;
        for (let y = 0; y < res.#r; ++y) {
            for (let x = 0; x < res.#c; ++x) {
                res.#data[dataIdx++] = this.val(y, x);
            }
        }
        return res;
    }

    changeRow(r: number, row: Matrix<1, C>) {
        let res = new Matrix(this.#r, this.#c, this.#data);
        let baseIdx = r * this.#c;
        for (let x = 0; x < this.#c; ++x) {
            res.#data[baseIdx + x] = row.val(x, 0);
        }
        return res;
    }

    swapRow(r1: number, r2: number) {
        let row1 = this.getRow(r1);
        let row2 = this.getRow(r2);
        return this.changeRow(r1, row2)
            .changeRow(r2, row1);
    }

    rowMultiBy(r: number, multiBy: number) {
        let row = this.getRow(r);
        let multiplyer = Matrix.number(multiBy);
        row = multiplyer.multiply(row);
        return this.changeRow(r, row);
    }

    rowAddToRow(r: number, addTo: number) {
        let row = this.getRow(addTo);
        let addBy = this.getRow(r);
        let newRow = row.add(addBy);
        let res = this.changeRow(addTo, newRow);
        return res;
    }
}