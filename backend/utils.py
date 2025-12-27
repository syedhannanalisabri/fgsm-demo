import base64
import io
from PIL import Image, ImageOps
import numpy as np
import torch

def preprocess_image_to_mnist_tensor(image_bytes: bytes) -> torch.Tensor:
    """
    Converts uploaded PNG/JPEG bytes to MNIST-like tensor: (1,1,28,28) in [0,1]
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
    # MNIST digits are typically white-on-black; many user images are black-on-white.
    # We'll invert to help when user uploads black digit on white background.
    img = ImageOps.invert(img)

    img = img.resize((28, 28))
    arr = np.array(img).astype(np.float32) / 255.0
    tensor = torch.from_numpy(arr).unsqueeze(0).unsqueeze(0)  # (1,1,28,28)
    return tensor

def tensor_to_base64_png(t: torch.Tensor) -> str:
    """
    t: (1,1,H,W) in [0,1]
    returns: base64 PNG string (no data URI prefix)
    """
    t = t.detach().cpu().clamp(0, 1)
    arr = (t[0,0].numpy() * 255.0).astype(np.uint8)
    img = Image.fromarray(arr, mode="L")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")
