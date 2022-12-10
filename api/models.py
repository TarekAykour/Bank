from datetime import datetime
from time import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class User(AbstractUser):
    country = models.CharField(max_length=255, default='NL')
    balance = models.FloatField( default=500.99)
    savings = models.FloatField( default=0)
    iban = models.CharField(null=True, max_length=255)
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "country": self.country,
            "balance": self.balance,
            "savings": self.savings,
            "email": self.email,
            "iban": self.iban,
            "logged": self.is_authenticated
            
        }

class Transaction(models.Model):
    user = models.ForeignKey(User, models.CASCADE, null=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions_sent")
    sender_iban = models.CharField(max_length=255, null=True)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions_received")
    recipient_iban = models.CharField(max_length=255, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    amount = models.FloatField()
    description = models.CharField(max_length=255,null=True,blank=True)

    
   

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.username,
            "sender_iban": self.sender_iban,
            "recipient": self.recipient.username,
            "recipient_iban": self.recipient_iban,
            "timestamp": self.timestamp,
            "amount": self.amount,
            "description": self.description
        }
