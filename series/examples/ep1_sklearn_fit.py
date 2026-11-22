"""The same fit with scikit-learn. It solves the least-squares problem directly."""
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(7)
area = rng.uniform(40, 160, size=24)
price = 2.5 * area + 30 + rng.normal(0, 20, size=24)

X = area.reshape(-1, 1)                 # scikit-learn wants a 2-D feature table
model = LinearRegression().fit(X, price)
pred = model.predict(X)

print(f"price = {model.coef_[0]:.2f} * area + {model.intercept_:.1f}   (thousand $)")
print(f"loss (MSE) = {mean_squared_error(price, pred):.1f}")
print(f"a 100 m2 house: {model.predict([[100]])[0]:.0f} thousand $")
