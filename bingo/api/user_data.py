from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from bingo.models import BingoUser
from bingo.api.serializers import BingoUserSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the BingoUser for the currently authenticated user
        try:
            bingo_user = BingoUser.objects.get(owner=request.user)
        except BingoUser.DoesNotExist:
            return Response({"message": "User profile not found."}, status=404)

        # Serialize the BingoUser data
        # serializer = BingoUserSerializer(bingo_user)
        serializer = BingoUserSerializer(bingo_user, context={"request": request})

        return Response(serializer.data)
