from django.shortcuts import render
from django.http import HttpResponse 
from .models import User, Event, Participant, Expense
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.urls import reverse

def index(request):
    return render(request, "splitter/index.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "splitter/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "splitter/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "splitter/register.html", {
                "message": "Passwords must match."
            })

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "splitter/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "splitter/register.html")

# Registation
# Login
# Logout

# Create Event
# Edit Event
# Delete Event

# Add Expense
# Edit Expense
# Delete Expense

# Add Participant / Search participant
# Remove Participant

# Calculate Balances
# Calculate Payments


