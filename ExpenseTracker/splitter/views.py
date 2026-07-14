from django.shortcuts import get_object_or_404, redirect, render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
import json
import logging
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from .models import User, Event, Participant, Expense
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.urls import reverse
from django.db.models import Q
from django.core.paginator import Paginator
from django.utils.dateparse import parse_date

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

# EVENTS
@login_required
def events(request):
    events = Event.objects.filter(
        Q(created_by=request.user) |
        Q(participants__user=request.user)
    ).distinct().order_by('-created_at')[:10]
    return render(request, 'splitter/events.html', {'events': events})

@csrf_protect
@login_required
def create_event(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    name = data.get('name', '').strip()
    date_str = data.get('date')
    participants = data.get('participants', [])
    proceed = data.get('proceed', False)  # default is False

    if not name:
        return JsonResponse({'error': 'Name is required'}, status=400)

    event_date = parse_date(date_str) if date_str else None

    # Pre-validate participants
    invalid_emails = []
    for part in participants:
        if '@' in part:
            user_exists = User.objects.filter(email__iexact=part).exists()
            if not user_exists:
                invalid_emails.append(part)

    if invalid_emails and not proceed:
        return JsonResponse({
            'error': 'Some emails did not match any user.',
            'invalid_emails': invalid_emails,
            'message': 'Please correct these emails or set "proceed" to true to ignore them.'
        }, status=400)

    # Create event
    event = Event.objects.create(
        name=name,
        created_by=request.user,
        event_date=event_date
    )

    warnings = []

    # Add participants
    for part in participants:
        if '@' in part:
            user = User.objects.filter(email__iexact=part).first()
            if user:
                Participant.objects.create(
                    event=event,
                    name=user.get_full_name() or user.username,
                    user=user
                )
            else:
                warnings.append(f"No user found with email: {part}")
                logger.warning(f"No user found with email: {part}")
        else:
            Participant.objects.create(
                event=event,
                name=part
            )

    response_data = event.serialize()
    if warnings:
        response_data['warnings'] = warnings

    return JsonResponse(response_data, status=201)

@login_required
def list_events(request):
    if request.method == "GET":
        events_qs = Event.objects.filter(
            Q(created_by=request.user) |
            Q(participants__user=request.user)
        ).distinct().order_by('-created_at')

        offset = int(request.GET.get("offset", 0))
        limit = int(request.GET.get("limit", 10))

        events = events_qs[offset:offset + limit]

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


