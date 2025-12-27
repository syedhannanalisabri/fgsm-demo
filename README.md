DevNeuron AI Assessment — FGSM Adversarial Attack Demo
Overview

This project demonstrates the Fast Gradient Sign Method (FGSM) adversarial attack on an image classification model. A neural network trained on MNIST is attacked by adding small, carefully chosen perturbations to the input image, causing the model to make incorrect predictions with high confidence.

The system includes:

A FastAPI backend that performs FGSM attacks on uploaded images

A Next.js frontend that allows users to interactively upload images, adjust attack strength (epsilon), and visualize results

End-to-end demonstration of adversarial robustness evaluation

Tech Stack

Backend: Python, FastAPI, PyTorch

Frontend: Next.js (React)

Adversarial Attack: Fast Gradient Sign Method (FGSM)

Deployment: Render (Free Tier) (see Deployment section)

Project Structure
DevNeuron/
├── backend/
│   ├── app_fgsm.py
│   ├── fgsm.py
│   ├── model.py
│   ├── utils.py
│   ├── requirements.txt
│   └── outputs/
│       └── screenshots
├── frontend/
│   ├── src/app/page.tsx
│   ├── next.config.js
│   └── screenshots
└── README.md

How to Run Locally
Backend (FastAPI + PyTorch)
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt


Evaluate model robustness using FGSM:

python eval_attack.py


Start the FastAPI server:

uvicorn app_fgsm:app --reload --host 0.0.0.0 --port 8000


Open API docs:

http://localhost:8000/docs

Frontend (Next.js)
cd frontend
npm install


Create .env.local:

NEXT_PUBLIC_API_BASE=http://localhost:8000


Run the development server:

npm run dev


Open the UI:

http://localhost:3000

FGSM Explanation (in my own words)

FGSM is an adversarial attack technique that slightly modifies an input image in the direction that maximally increases the model’s loss. It computes the gradient of the loss with respect to the input pixels, takes the sign of this gradient, and adds a scaled version of it to the original image.

Even though the perturbation is very small and often imperceptible to humans, it can significantly change the model’s prediction. This happens because neural networks behave approximately linearly in high-dimensional input spaces, allowing many small changes to accumulate into a large effect on the output.

Mathematically:

x_adv = x + ε · sign(∇x J(θ, x, y))


where ε controls the attack strength.

Observations

The clean model achieves high accuracy on MNIST images.

As epsilon increases, accuracy on adversarial examples drops sharply.

For small epsilon values (e.g., 0.02–0.05), the image looks nearly identical, yet predictions can already change.

Larger epsilon values introduce visible noise and almost always cause misclassification.

This demonstrates how vulnerable standard neural networks are to adversarial perturbations.

Deployment
Deployed URLs

Frontend: (to be added after deployment)

Backend API: (to be added after deployment)

Deployment Note

AWS Free Tier deployment was not possible due to an account billing lock from a previously exhausted Free Tier allocation. As allowed in the assessment instructions, the application is deployed using Render Free Tier instead.

Screenshots

Relevant screenshots demonstrating:

FGSM evaluation results

FastAPI /attack endpoint

Successful adversarial attack execution

Frontend UI before and after attack
are included in the submission archive.

Notes

No datasets are included in the submission.

Only lightweight model files are used.

All external libraries are open-source and properly attributed.