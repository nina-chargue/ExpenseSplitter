from django.db import models
from django.contrib.auth.models import User
from django.db import models

# python manage.py makemigrations
# python manage.py migrate

class Event(models.Model):
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    created_at = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at,
            'created_by': self.created_by.username,
        }

class Participant(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='participants')
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='participant_profiles')

    def __str__(self):
        return f"{self.name} ({self.event.name})"
    
class Expense(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='expenses')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_by = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='expenses_paid')
    shared_among = models.ManyToManyField(Participant, related_name='expenses_shared')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount} ({self.event.name})"
    

# DATABASE RELATIONSHIP EXPLANATION

# User → Event: A user creates an event (created_by).

# Event → Participant: Participants belong to a specific event.

# Participant → User (optional): A participant may be linked to a registered user (optional).

# Event → Expense: Expenses belong to an event.

# Expense → paid_by (Participant): Each expense was paid by one participant.

# Expense → shared_among (Participant M2M): Each expense is shared among multiple participants.
