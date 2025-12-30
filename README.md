# FGSM Adversarial Attack Demo 

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)

An interactive demonstration of adversarial attacks on neural networks using the Fast Gradient Sign Method (FGSM). This project showcases how small, imperceptible perturbations can fool deep learning models, highlighting the importance of adversarial robustness in machine learning systems.

##  Overview

This full-stack application demonstrates adversarial attacks on an MNIST-trained neural network. Users can upload digit images, adjust attack parameters, and visualize how adversarial perturbations cause misclassifications with high confidence scores.

### Key Features

- **Interactive Web Interface**: Upload images and experiment with different epsilon values in real-time
- **Visual Comparison**: Side-by-side view of original images, perturbations, and adversarial examples
- **Real-time Predictions**: See confidence scores for both clean and attacked images
- **RESTful API**: FastAPI backend with comprehensive documentation
- **Production Ready**: Deployed with CI/CD pipeline and comprehensive error handling

##  Architecture

```
┌─────────────────┐      HTTP      ┌─────────────────┐
│                 │ ◄────────────► │                 │
│  Next.js        │                │  FastAPI        │
│  Frontend       │                │  Backend        │
│                 │                │                 │
└─────────────────┘                └────────┬────────┘
                                            │
                                            ▼
                                   ┌────────────────┐
                                   │  PyTorch Model │
                                   │  + FGSM Attack │
                                   └────────────────┘
```

##  Quick Start

### Prerequisites

- Python 3.11
- Node.js 20 or higher
- npm 

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Unix/macOS:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app_fgsm:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with interactive documentation at `http://localhost:8000/docs`.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_BASE=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
fgsm-demo/
├── backend/
│   ├── app_fgsm.py          # FastAPI application
│   ├── fgsm.py              # FGSM attack implementation
│   ├── model.py             # Neural network architecture
│   ├── utils.py             # Helper functions
│   ├── requirements.txt     # Python dependencies
│   └── outputs/             # Generated outputs
│       └── screenshots/     # Backend screenshots
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       └── page.tsx     # Main application page
│   ├── next.config.js       # Next.js configuration
│   ├── package.json         # Node dependencies
│   └── screenshots/         # Frontend screenshots
│
├── .github/
│   └── workflows/           # CI/CD pipelines
│
├── .gitignore
└── README.md
```

## Understanding FGSM

### What is FGSM?

FGSM is a method for generating 'adversarial examples' to fool neural networks. It uses the model's own gradients to create a specific noise pattern that increases the loss. When this invisible noise is added to an image, it tricks the model into predicting the wrong class, even though the image looks normal to us.

### Mathematical Formulation

```
x_adv = x + ε · sign(∇_x J(θ, x, y))
```

Where:
- `x` is the original input image
- `x_adv` is the adversarial example
- `ε` (epsilon) controls the perturbation magnitude
- `J(θ, x, y)` is the loss function
- `∇_x` represents the gradient with respect to the input

### Why Does It Work?

Neural networks behave approximately linearly in high-dimensional spaces. While each pixel's perturbation is small, the cumulative effect across thousands of pixels can dramatically alter the model's output. This counterintuitive vulnerability demonstrates that deep learning models can be fragile despite high accuracy on clean data.

## Experimental Results

### Accuracy vs Epsilon

| Epsilon | Clean Accuracy | Adversarial Accuracy | Accuracy Drop |
|---------|---------------|---------------------|---------------|
| 0.00    | 97.72%         | 97.72%               | 0.0%          |
| 0.05    | 98.72%         | 94.85%               | 0.2%         |
| 0.10    | 98.72%         | 87.28%               | 10.44%         |
| 0.20    | 98.72%         | 45.52%               | 52.20%         |
| 0.25    | 98.72%         | 20.86%               | 76.86%         |


### Key Observations

- **Imperceptible Perturbations**: At ε = 0.05, perturbations are nearly invisible to humans, yet accuracy drops significantly
- **Confidence Manipulation**: The model often predicts incorrect classes with high confidence (>90%)
- **Non-linear Degradation**: Attack effectiveness increases non-linearly with epsilon
- **Universal Vulnerability**: All digit classes show similar susceptibility to FGSM attacks

## API Reference

### POST `/attack`

Generate an adversarial example using FGSM.

**Request Body:**
```json
{
  "image": "base64_encoded_image",
  "epsilon": 0.1
}
```

**Response:**
```json
{
  "original_prediction": 7,
  "original_confidence": 0.99,
  "adversarial_prediction": 3,
  "adversarial_confidence": 0.95,
  "epsilon": 0.1,
  "perturbation": "base64_encoded_perturbation",
  "adversarial_image": "base64_encoded_adversarial"
}
```

**Parameters:**
- `image`: Base64-encoded grayscale image (28x28)
- `epsilon`: Float between 0.0 and 1.0 (default: 0.1)

## Evaluation Script

Run comprehensive adversarial robustness evaluation:

```bash
cd backend
python eval_attack.py
```

This script:
- Tests multiple epsilon values (0.0 to 0.3)
- Generates accuracy reports
- Creates visualization plots
- Saves results to `outputs/`

## Deployment

### Live Demo

- **Frontend**: https://polite-island-0ac01f90f.4.azurestaticapps.net
- **Backend API**: https://fgsm-backend-syedh-01.azurewebsites.net/docs#/default/attack_attack_post

### Deployment Notes

Deployment Notes
This project is deployed on Microsoft Azure using student credits. While I have prior experience with AWS services (EC2, S3) from previous coursework, I had already exhausted my AWS Free Tier allocation. This presented an opportunity to expand my cloud platform expertise by using Azure for the first time.

The deployment includes:

- Automatic deployments from the main branch
- Environment variable management
- Health check endpoints
- CORS configuration for frontend-backend communication





## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework
- **PyTorch**: Deep learning framework for model training and inference
- **Torchvision**: Pre-built datasets and transformations
- **Pillow**: Image processing
- **NumPy**: Numerical computations

### Frontend
- **Next.js**: React framework with App Router
- **TypeScript**: Type-safe development
- **Fetch API**: HTTP client for backend communication

### DevOps
- **GitHub Actions**: CI/CD pipeline
- **Azure with Docker**: Backend hosting
- **Azure**: Frontend hosting

## 📚 Resources

### Academic Papers
- [Explaining and Harnessing Adversarial Examples](https://arxiv.org/abs/1412.6572) (Goodfellow et al., 2015)
- [Adversarial Examples Are Not Easily Detected](https://arxiv.org/abs/1705.07263)

### Additional Reading
- [Adversarial Robustness Toolbox](https://github.com/Trusted-AI/adversarial-robustness-toolbox)
- [CleverHans: Python Library for Adversarial Examples](https://github.com/cleverhans-lab/cleverhans)




## 📧 Contact

Syed Hannan Ali Sabri - [GitHub](https://github.com/syedhannanalisabri)

Project Link: [https://github.com/syedhannanalisabri/fgsm-demo](https://github.com/syedhannanalisabri/fgsm-demo)

---

**Note**: This project is for educational purposes only. Adversarial attacks should only be used for research and improving model robustness, not for malicious purposes.
