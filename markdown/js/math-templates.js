/**
 * 数学公式模板集合
 * 提供各种类型的数学公式模板供用户选择
 */

const mathTemplates = {
    // 基础数学公式
    basic: {
        quadratic: `x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}`,
        pythagorean: `a^2 + b^2 = c^2`,
        binomial: `(x+y)^n = \sum_{k=0}^{n} {n \choose k}x^{n-k}y^k`,
        euler: `e^{i\pi} + 1 = 0`
    },
    
    // 微积分公式
    calculus: {
        derivative: `\frac{d}{dx}(\int_{a}^{x} f(t) dt) = f(x)`,
        integral: `\int_{a}^{b} x^n dx = \left[ \frac{x^{n+1}}{n+1} \right]_{a}^{b}`,
        partialDerivative: `\frac{\partial^2 f}{\partial x\partial y} = \frac{\partial^2 f}{\partial y\partial x}`,
        taylorSeries: `f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!} (x-a)^n`
    },
    
    // 线性代数公式
    linearAlgebra: {
        determinant: `\det(A) = \sum_{\sigma \in S_n} \text{sgn}(\sigma) \prod_{i=1}^{n} a_{i,\sigma(i)}`,
        matrixMultiplication: `(AB)_{ij} = \sum_{k=1}^{n} a_{ik}b_{kj}`,
        eigenvalue: `Av = \lambda v`,
        trace: `\text{tr}(A) = \sum_{i=1}^{n} a_{ii}`
    },
    
    // 统计与概率公式
    statistics: {
        normalDistribution: `f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}(\frac{x-\mu}{\sigma})^2}`,
        variance: `\text{Var}(X) = E[(X - E[X])^2]`,
        bayes: `P(A|B) = \frac{P(B|A)P(A)}{P(B)}`,
        correlation: `\rho_{X,Y} = \frac{\text{Cov}(X,Y)}{\sigma_X \sigma_Y}`
    },
    
    // 物理公式
    physics: {
        einstein: `E = mc^2`,
        newton: `F = ma`,
        gravitation: `F = G\frac{m_1 m_2}{r^2}`,
        schrodinger: `i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r},t) = \hat H\Psi(\mathbf{r},t)`
    },
    
    // 几何公式
    geometry: {
        circleArea: `A = \pi r^2`,
        sphereVolume: `V = \frac{4}{3}\pi r^3`,
        distance: `d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}`,
        vectorCross: `\vec{a} \times \vec{b} = |\vec{a}||\vec{b}|\sin(\theta)\hat{n}`
    },
    
    // 离散数学公式
    discrete: {
        summation: `\sum_{i=1}^{n} i = \frac{n(n+1)}{2}`,
        factorial: `n! = n \cdot (n-1) \cdot (n-2) \cdot \ldots \cdot 2 \cdot 1`,
        permutation: `P(n,r) = \frac{n!}{(n-r)!}`,
        combination: `C(n,r) = {n \choose r} = \frac{n!}{r!(n-r)!}`
    }
};

// 导出模板对象供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mathTemplates;
}