import numpy as np
from xgboost import XGBClassifier
from onnxmltools.convert import convert_xgboost
from onnxconverter_common.data_types import FloatTensorType
import onnxruntime as ort

X = np.random.rand(10, 5).astype(np.float32)
y = np.random.randint(0, 2, 10)
clf = XGBClassifier()
clf.fit(X, y)
initial_type = [('float_input', FloatTensorType([None, 5]))]
onnx_model = convert_xgboost(clf, initial_types=initial_type)
with open("test.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

sess = ort.InferenceSession("test.onnx")
res = sess.run(None, {'float_input': X})
print("SUCCESS!")
