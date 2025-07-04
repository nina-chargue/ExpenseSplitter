from django.shortcuts import get_object_or_404, redirect, render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
import json
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from .models import User, Event, Participant, Expense
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.urls import reverse
from django.db.models import Q

def index(request):
    return render(request, "splitter/index.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("events"))
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
        return HttpResponseRedirect(reverse("events"))
    else:
        return render(request, "splitter/register.html")
    
@login_required
def events(request):
    return render(request, "splitter/events.html")

@csrf_protect
@login_required
def create_event(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            event = Event.objects.create(
                name=data["name"],
                created_by=request.user
            )
            return JsonResponse(event.serialize(), safe=False)
        except Exception as e:
            print(e)
            return JsonResponse({"error": "Could not create event"}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)


@login_required
def list_events(request):
    if request.method == "GET":
        events = Event.objects.filter(
            Q(created_by=request.user) |
            Q(participants__user=request.user)
        ).distinct().order_by('-created_at')
        data = [e.serialize() for e in events]
        return JsonResponse(data, safe=False)
    return JsonResponse({"error": "Method not allowed"}, status=405)


@login_required
def get_event(request, event_id):
    if request.method == "GET":
        event = get_object_or_404(Event, id=event_id)
        if event.created_by != request.user or event.participants != request.user:
            return JsonResponse({"error": "Forbidden"}, status=403)
        return JsonResponse(event.serialize(), safe=False)
    return JsonResponse({"error": "Method not allowed"}, status=405)

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


