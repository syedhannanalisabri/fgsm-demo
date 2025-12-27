import torch
import torch.nn.functional as F

class FGSMAttack:
    """
    Fast Gradient Sign Method (FGSM) attacker.

    Generates adversarial examples:
        x_adv = clamp(x + eps * sign(grad_x(loss)), [0,1])
    """
    def __init__(self, model: torch.nn.Module, device: torch.device):
        self.model = model
        self.device = device

    @torch.no_grad()
    def predict(self, x: torch.Tensor) -> int:
        self.model.eval()
        logits = self.model(x)
        return int(torch.argmax(logits, dim=1).item())

    def generate(self, x: torch.Tensor, y: torch.Tensor, epsilon: float) -> torch.Tensor:
        """
        x: input tensor (1, C, H, W) in [0,1]
        y: true/assumed label tensor (1,)
        """
        self.model.eval()

        x = x.clone().detach().to(self.device)
        y = y.clone().detach().to(self.device)

        x.requires_grad_(True)

        logits = self.model(x)
        loss = F.cross_entropy(logits, y)

        self.model.zero_grad(set_to_none=True)
        loss.backward()

        grad_sign = x.grad.detach().sign()
        x_adv = x + float(epsilon) * grad_sign
        x_adv = torch.clamp(x_adv, 0.0, 1.0).detach()

        return x_adv
