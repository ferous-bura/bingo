
from django.contrib.auth.views import PasswordChangeView
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib.auth.mixins import LoginRequiredMixin

from django.shortcuts import render, redirect
from django.contrib.auth import logout, authenticate, login

from django.http import Http404


class CustomPasswordChangeView(LoginRequiredMixin, SuccessMessageMixin, PasswordChangeView):
    template_name = 'bingo/change_password.html'  # Template for the change password page
    success_message = "Your password has been updated successfully!"
    success_url = reverse_lazy('login')  # Redirect after successful password change


def logout_view(request):
    logout(request)
    return redirect('/login')

def login_view(request):
    error_message = None

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_staff:  # Check if the user is an admin/staff
                return redirect("/admin/")  # Redirect to the Django admin panel
            login(request, user)
            return redirect("bingo")  # Redirect to the bingo page
        else:
            # If the user is not found
            raise Http404("User not found.")

    return render(request, "bingo/login.html", {"error_message": error_message})
