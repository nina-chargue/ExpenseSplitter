from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path("events/", views.events, name="events"),
    # path('logout/', views.logout_view, name='logout'),
    # path('event/<int:event_id>/add_expense/', views.add_expense, name='add_expense'),
    # path('event/<int:event_id>/add_participant/', views.add_participant, name='add_participant'),
    # path('event/<int:event_id>/calculate_balances/', views.calculate_balances, name='calculate_balances'),
    # # thinking to add a feature in which the user can see if the participant has paid or not
    # path('event/<int:event_id>/calculate_payments/', views.calculate_payments, name='calculate_payments'),

    path('api/events/create', views.create_event, name='create_event'),
    path('api/events/', views.list_events, name='list_events'),
    path('api/events/<int:event_id>/', views.get_event, name='get_event'),

]