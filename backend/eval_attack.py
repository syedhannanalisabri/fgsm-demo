import torch
import torchvision
import torchvision.transforms as transforms
from torch.utils.data import DataLoader
from model import MNISTCNN
from fgsm import FGSMAttack

def train_quick(model, device):
    train_ds = torchvision.datasets.MNIST(
        root="./data", train=True, download=True,
        transform=transforms.ToTensor()
    )
    train_loader = DataLoader(train_ds, batch_size=128, shuffle=True)

    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
    model.train()
    for epoch in range(1):  
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            opt.zero_grad(set_to_none=True)
            logits = model(x)
            loss = torch.nn.functional.cross_entropy(logits, y)
            loss.backward()
            opt.step()

def eval_clean(model, device, loader):
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            pred = model(x).argmax(dim=1)
            correct += (pred == y).sum().item()
            total += y.size(0)
    return correct / total

def eval_fgsm(model, device, loader, epsilon):
    attacker = FGSMAttack(model, device)
    model.eval()
    correct = 0
    total = 0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        # Generate adversarial images using true labels
        x_adv = attacker.generate(x, y, epsilon=epsilon)
        with torch.no_grad():
            pred = model(x_adv).argmax(dim=1)
        correct += (pred == y).sum().item()
        total += y.size(0)
    return correct / total

def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MNISTCNN().to(device)

    print("Training quick model (1 epoch)...")
    train_quick(model, device)

    test_ds = torchvision.datasets.MNIST(
        root="./data", train=False, download=True,
        transform=transforms.ToTensor()
    )
    test_loader = DataLoader(test_ds, batch_size=256, shuffle=False)

    clean_acc = eval_clean(model, device, test_loader)
    print(f"Clean accuracy: {clean_acc:.4f}")

    for eps in [0.05, 0.1, 0.2, 0.25]:
        adv_acc = eval_fgsm(model, device, test_loader, epsilon=eps)
        print(f"Epsilon={eps:.2f} | Adversarial accuracy: {adv_acc:.4f} | Drop: {clean_acc-adv_acc:.4f}")

    # Save weights (small)
    torch.save(model.state_dict(), "mnist_cnn.pt")
    print("Saved model: mnist_cnn.pt")

if __name__ == "__main__":
    main()
