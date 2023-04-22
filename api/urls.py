from django.urls import path
from . import views


urlpatterns = [
    # api urls
    path("users", views.users, name="users"),
    path('register', views.register, name="register"),
    path('login', views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("user", views.current_user, name="user"),
    path("transfer", views.make_transaction, name="transfer"),
    path("transactions", views.transactions, name="transactions"),
    path("update_user/<int:id>", views.update_user, name="update_user"),
    path("delete_user/<int:id>", views.delete_user, name="delete_user"),
    path("savings_add", views.savings_add, name="savings_add"),
    path("savings_remove", views.savings_remove, name="savings_remove"),
    path('csrf/', views.csrf),
    
]