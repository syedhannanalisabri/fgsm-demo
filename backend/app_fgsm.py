from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import torch

from model import MNISTCNN
from fgsm import FGSMAttack
from utils import preprocess_image_to_mnist_tensor, tensor_to_base64_png

app = FastAPI(title="FGSM Attack API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL = MNISTCNN().to(DEVICE)
MODEL.load_state_dict(torch.load("mnist_cnn.pt", map_location=DEVICE))
MODEL.eval()

ATTACKER = FGSMAttack(MODEL, DEVICE)

@app.post("/attack")
async def attack(
    image: UploadFile = File(...),
    epsilon: float = Form(0.1),
):
    image_bytes = await image.read()
    x = preprocess_image_to_mnist_tensor(image_bytes).to(DEVICE)

    # Clean prediction
    with torch.no_grad():
        clean_logits = MODEL(x)
        clean_pred = int(clean_logits.argmax(dim=1).item())


    y = torch.tensor([clean_pred], device=DEVICE)

    x_adv = ATTACKER.generate(x, y, epsilon=epsilon)

    with torch.no_grad():
        adv_logits = MODEL(x_adv)
        adv_pred = int(adv_logits.argmax(dim=1).item())

    success = (adv_pred != clean_pred)

    adv_b64 = tensor_to_base64_png(x_adv)

    return {
        "clean_prediction": clean_pred,
        "adversarial_prediction": adv_pred,
        "attack_success": success,
        "epsilon": float(epsilon),
        "adversarial_image_base64": adv_b64,
    }
